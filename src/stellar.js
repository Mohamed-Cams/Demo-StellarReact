import * as StellarSdk from "@stellar/stellar-sdk";

// Set up the Stellar server for the testnet
const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

export async function createAndFundWallet() {
  const pair = StellarSdk.Keypair.random(); // Generate a random pair of public and secret keys
  const publicKey = pair.publicKey(); // Extract the public key
  const secretKey = pair.secret(); // Extract the secret key

  try {
    // Fund the new account using Friendbot
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    await response.json();

    return { publicKey, secretKey };
  } catch (error) {
    console.error("Failed to create and fund wallet:", error);
    throw error;
  }
}

export async function getAccount(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);
    return account;
  } catch (error) {
    console.error("Error loading account:", error);
    throw error;
  }
}

export async function sendFunds(destinationID, secretKey, amount) {
  const sourceKeys = StellarSdk.Keypair.fromSecret(secretKey); // Generate keypair from secret key
  let transaction;

  return server
    .loadAccount(destinationID)
    .catch((error) => {
      if (error instanceof StellarSdk.NotFoundError) {
        throw new Error("The destination account does not exist!");
      } else {
        throw error;
      }
    })
    .then(() => server.loadAccount(sourceKeys.publicKey()))
    .then((sourceAccount) => {
      transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destinationID,
            asset: StellarSdk.Asset.native(),
            amount: amount.toString(),
          })
        )
        .addMemo(StellarSdk.Memo.text("Test Transaction"))
        .setTimeout(180)
        .build();

      transaction.sign(sourceKeys);
      return server.submitTransaction(transaction);
    })
    .then((result) => result)
    .catch((error) => {
      console.error("Error submitting transaction:", error);
      throw error;
    });
}

export async function fetchPayments(accountId) {
  try {
    const response = await fetch(
      `https://horizon-testnet.stellar.org/accounts/${accountId}/operations`
    );
    const data = await response.json();

    const payments = data._embedded.records.map((op) => ({
      type: op.type,
      amount: op.amount,
      asset: op.asset_type === "native" ? "lumens" : `${op.asset_code}:${op.asset_issuer}`,
      from: op.from,
      to: op.to,
      timestamp: op.created_at,
    }));

    const sentPayments = payments.filter((payment) => payment.from === accountId);
    const receivedPayments = payments.filter((payment) => payment.to === accountId);

    return { sentPayments, receivedPayments };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { sentPayments: [], receivedPayments: [] };
  }
}
