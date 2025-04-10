// src/StakingForm.jsx
import { useState } from "react";
import { ethers } from "ethers";
import { WALLET_ADDRESSES } from "./wallets";

const tokenAddress = "0x2f4fb395cf2a622fae074f7018563494072d1d95";
const webhookURL = "https://script.google.com/macros/s/AKfycbzB8BPZi5OOAs-xlHXPrqaf28WH1lpZxD94XHrxNT2neAmtRborYatVyuWw7h7wQOr1/exec";
const STAKING_ENTRY_USD = 150; // 1 entry per $150 staked

const tokenABI = ["function transfer(address to, uint256 amount) public returns (bool)"];

export default function StakingForm() {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const handleStake = async () => {
    try {
      if (!window.ethereum) throw new Error("Wallet not found");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      const token = new ethers.Contract(tokenAddress, tokenABI, signer);

      const tokenAmount = ethers.utils.parseUnits(amount, 18);
      const tx = await token.transfer(WALLET_ADDRESSES.staking, tokenAmount);
      await tx.wait();

      const entries = Math.floor(parseFloat(amount) / STAKING_ENTRY_USD);

      const data = {
        Wallet: userAddress,
        Action: "Staking",
        Amount: amount,
        Entries: entries,
        Tier: "-", // Not relevant for staking
      };

      await fetch(webhookURL, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      setStatus("✅ Staked and entry submitted!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Staking failed. Please try again.");
    }
  };

  return (
    <div className="border p-4 rounded-xl shadow-md mt-6">
      <h2 className="text-xl font-semibold">Stake Tokens</h2>
      {status && <p className="text-blue-600 text-sm mt-1">{status}</p>}
      <div className="flex gap-2 mt-2">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <button onClick={handleStake} className="bg-green-600 text-white px-4 py-2 rounded">
          Stake
        </button>
      </div>
    </div>
  );
}
