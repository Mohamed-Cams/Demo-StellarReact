import { useState, useEffect } from "react";
import { getAccount, sendFunds, fetchPayments } from "./stellar";

const Account = ({ publicKey, secretKey }) => {
    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [destination, setDestination] = useState({ id: "", amount: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadAccountData = async () => {
            try {
                const accountData = await getAccount(publicKey);
                setAccount(accountData);
            } catch (error) {
                console.error("Failed to load account data:", error);
            }
        };

        loadAccountData();
    }, [publicKey]);

    useEffect(() => {
        const loadPayments = async () => {
            try {
                const { receivedPayments } = await fetchPayments(publicKey);
                setTransactions(receivedPayments);
            } catch (error) {
                console.error("Failed to fetch payments:", error);
            }
        };

        loadPayments();
    }, [publicKey]);

    const handleSendFunds = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await sendFunds(destination.id, secretKey, destination.amount);
            alert("Funds sent successfully!");
        } catch (error) {
            console.error("Failed to send funds:", error);
            alert("Failed to send funds. See console for details.");
        }
        setLoading(false);
    };

    return (
        <div>
            <h3>Wallet Details</h3>
            {account ? (
                <div>
                    <p>
                        <b>Public Key:</b> {publicKey}
                    </p>
                    <p>
                        <b>Balance:</b>{" "}
                        {account.balances.map((balance, index) => (
                            <span key={index}>
                                {balance.balance} {balance.asset_type === "native" ? "lumens" : balance.asset_code}
                            </span>
                        ))}
                    </p>
                    <hr />
                    <h4>Send Funds</h4>
                    <form onSubmit={handleSendFunds}>
                        <input
                            type="text"
                            placeholder="Recipient Public Key"
                            value={destination.id}
                            onChange={(e) =>
                                setDestination({ ...destination, id: e.target.value })
                            }
                        />
                        <input
                            type="number"
                            placeholder="Amount"
                            value={destination.amount}
                            onChange={(e) =>
                                setDestination({ ...destination, amount: e.target.value })
                            }
                        />
                        <button disabled={loading} type="submit">
                            Send Funds
                        </button>
                    </form>
                    <hr />
                    <div>
                        <h4>Transactions</h4>
                        <div>
                            {transactions.length ? (
                                transactions.map((transaction, index) => (
                                    <div key={index}>
                                        <p>
                                            <b>Type:</b> {transaction.type}
                                        </p>
                                        <p>
                                            <b>Amount:</b> {transaction.amount} {transaction.asset}
                                        </p>
                                        <p>
                                            <b>To:</b> {transaction.to}
                                        </p>
                                        <p>
                                            <b>Timestamp:</b> {transaction.timestamp}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p>No transactions found.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <p>Loading account data...</p>
            )}
        </div>
    );
};

export default Account;