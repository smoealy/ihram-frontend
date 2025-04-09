import { useState } from "react";

export default function DonationForm() {
  const [amount, setAmount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleDonate = async () => {
    console.log("Donating", amount, "IHRAM");
    // Add contract interaction here
    setSubmitted(true);
  };

  return (
    <div className="border p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold">Donate Tokens</h2>
      <input
        type="number"
        placeholder="Amount to Donate"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="p-2 border rounded-md mr-2"
      />
      <button onClick={handleDonate} className="bg-red-600 text-white px-4 py-2 rounded-md mt-2">
        Donate
      </button>
      {submitted && <p className="text-green-600 mt-2">Donation successful!</p>}
    </div>
  );
}
