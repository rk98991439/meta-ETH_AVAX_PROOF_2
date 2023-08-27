import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionAmount, setTransactionAmount] = useState(1);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected:", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const performTransaction = async (isDeposit) => {
    if (atm) {
      const txFunction = isDeposit ? atm.deposit : atm.withdraw;
      let tx = await txFunction(transactionAmount);
      await tx.wait();
      getBalance();
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this ATM.</p>;
    }

    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your MetaMask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div className="user-info">
        <h2>Your Balance: {balance} ETH</h2>
        <div className="transaction-inputs">
          <label htmlFor="transactionAmount">Transaction Amount (ETH):</label>
          <input
            type="number"
            id="transactionAmount"
            value={transactionAmount}
            onChange={(e) => setTransactionAmount(e.target.value)}
            min="0"
            step="0.01"
          />

          <p>

          </p>
        </div>
        <div className="transaction-buttons">
          <button
            className="action-button deposit-button"
            name="deposit-button"
            onClick={() => performTransaction(true)}
            style={{
              backgroundColor: "#08d411",
              color: "white",
              marginRight: "10px",
              padding: "8px 16px",
              borderRadius: "5px",
              fontSize: "16px",
            }}
          >
            Deposit
          </button>
          <button
            className="action-button withdraw-button"
            name="withdraw-button"
            onClick={() => performTransaction(false)}
            style={{
              backgroundColor: "#ed0000",
              color: "white",
              padding: "8px 16px",
              borderRadius: "5px",
              fontSize: "16px",
            }}
          >
            Withdraw
          </button>
        </div>

      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}

      <style jsx>{`
        .container {
          text-align: center;
          background-color: #f7f7f7;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
          max-width: 400px;
          margin: 0 auto;
        }
        header {
          background-color: #303f9f;
          color: white;
          padding: 1rem;
          border-radius: 10px 10px 0 0;
        }
        .user-info {
          background-color: white;
          padding: 1rem;
          border-radius: 10px;
          margin-top: 2rem;
          box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
        }
        .transaction-inputs {
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
        }
        label {
          margin-right: 0.5rem;
        }
        .action-button:disabled {
          background-color: #b0b0b0;
          cursor: not-allowed;
        }
        .action-button:hover {
          transform: scale(1.05);
        }
      `}</style>
    </main>
  );
}
