mport { useState } from "react";

export default function StakingForm() {
  const [amount, setAmount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleStake = async () => {
    console.log("Staking", amount, "IHRAM");
    // Add contract interaction here
    setSubmitted(true);
  };

  return (
    <div className="border p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold">Stake Tokens</h2>
      <input
        type="number"
        placeholder="Amount to Stake"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="p-2 border rounded-md mr-2"
      />
      <button onClick={handleStake} className="bg-purple-600 text-white px-4 py-2 rounded-md mt-2">
        Stake
      </button>
      {submitted && <p className="text-green-600 mt-2">Staked successfully!</p>}
    </div>
  );
}
