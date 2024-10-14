import { useState } from "react";
import { createAndFundWallet } from "./stellar";
import Account from './Account';

const App = () => {
    const [loading, setLoading] = useState(false);
    const [wallet, setWallet] = useState({ publicKey: "", secretKey: "" });
    const [inputKeys, setInputKeys] = useState({ publicKey: "", secretKey: "" });

    const handleCreateWallet = async () => {
        setLoading(true);
        try {
            const { publicKey, secretKey } = await createAndFundWallet();
            setWallet({ publicKey, secretKey });
        } catch (error) {
            console.error("Failed to create and fund wallet:", error);
        }
        setLoading(false);
    };

    const handleUseExistingWallet = () => {
        if (inputKeys.publicKey && inputKeys.secretKey) {
            setWallet(inputKeys);
        } else {
            alert("Please enter both public and secret keys.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputKeys((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            {!wallet.publicKey ? (
                <>
                    <button onClick={handleCreateWallet} disabled={loading}>
                        Create Wallet
                    </button>
                    <div>
                        <h3>Or Use an Existing Wallet</h3>
                        <input
                            type="text"
                            name="publicKey"
                            placeholder="Enter Public Key"
                            value={inputKeys.publicKey}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="secretKey"
                            placeholder

                            ="Enter Secret Key"
                            value={inputKeys.secretKey}
                            onChange={handleChange}
                        />
                        <button onClick={handleUseExistingWallet} disabled={loading}>
                            Use Wallet
                        </button>
                    </div>
                </>
            ) : (
                <Account publicKey={wallet.publicKey} secretKey={wallet.secretKey} />
            )}
        </div>
    );
};

export default App;