// src/StakingForm.jsx
import { useState } from "react";
import { WALLET_ADDRESSES } from "./wallets";

export default function StakingForm() {
  const [amount, setAmount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleStake = async () => {
    // Simulate token transfer logic here (actual transfer requires contract integration)
    console.log("Stake", amount, "tokens to", WALLET_ADDRESSES.staking);
    setSubmitted(true);
  };

  return (
    <div className="border p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold">Stake Tokens</h2>
      <input
        type="number"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="p-2 border rounded-md mr-2"
      />
      <button
        onClick={handleStake}
        className="bg-purple-600 text-white px-4 py-2 rounded-md mt-2"
      >
        Stake
      </button>
      {submitted && <p className="text-green-600 mt-2">Stake submitted!</p>}
    </div>
  );
}
