// src/StakingForm.jsx

import { useState } from "react";
import { ethers } from "ethers";
import { WALLET_ADDRESSES } from "./wallets";

const tokenABI = ["function transfer(address to, uint256 amount) returns (bool)"];
const tokenAddress = "0x2f4fb395cf2a622fae074f7018563494072d1d95"; // IHRAM Token (Sepolia)

export default function StakingForm() {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState(null);
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWallet(accounts[0]);
  };

  const handleStake = async () => {
    if (!wallet) return alert("Please connect your wallet");
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return alert("Enter a valid token amount");
    }

    try {
      setStatus("Waiting for confirmation...");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);

      const tx = await tokenContract.transfer(
        WALLET_ADDRESSES.staking,
        ethers.utils.parseUnits(amount, 18)
      );
      await tx.wait();

      setStatus("✅ Tokens staked successfully!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Staking failed. Please try again.");
    }
  };

  return (
    <div className="border p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-2">Stake Tokens</h2>
      <input
        type="number"
        placeholder="Amount of IHRAM"
        className="p-2 border rounded-md mr-2 w-full"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <div className="flex justify-between mt-2">
        <button onClick={connectWallet} className="bg-green-600 text-white px-4 py-2 rounded-md">
          {wallet ? wallet.slice(0, 6) + "..." + wallet.slice(-4) : "Connect Wallet"}
        </button>
        <button onClick={handleStake} className="bg-purple-600 text-white px-4 py-2 rounded-md">
          Stake
        </button>
      </div>
      {status && <p className="mt-2 text-sm text-gray-700">{status}</p>}
    </div>
  );
}
