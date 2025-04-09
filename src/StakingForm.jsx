// StakingForm.jsx
import { useState } from "react";

export default function StakingForm() {
  const [amount, setAmount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("https://script.google.com/macros/s/AKfycbwl1PZvvSbkvR6-0jLHEEQ4iyNDa_E-DNsW9xQS1ijVI60mk3q2rwaeIKbWyfPs3Ru6/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "staking",
        wallet: window.ethereum.selectedAddress,
        amount,
      }),
    });

    const data = await response.text();
    if (response.ok) {
      alert("Staking entry submitted!");
      setSubmitted(true);
    } else {
      alert("Submission failed. Try again.");
    }
  };

  return (
    <div className="border p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold">Stake Tokens</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="number"
          min="0"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter IHRAM amount to stake"
          className="p-2 border rounded w-full"
          required
        />
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-md">
          Submit Staking Entry
        </button>
      </form>
    </div>
  );
}

// DonationForm.jsx
import { useState } from "react";

export default function DonationForm() {
  const [amount, setAmount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("https://script.google.com/macros/s/AKfycbwl1PZvvSbkvR6-0jLHEEQ4iyNDa_E-DNsW9xQS1ijVI60mk3q2rwaeIKbWyfPs3Ru6/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "donation",
        wallet: window.ethereum.selectedAddress,
        amount,
      }),
    });

    const data = await response.text();
    if (response.ok) {
      alert("Donation entry submitted!");
      setSubmitted(true);
    } else {
      alert("Submission failed. Try again.");
    }
  };

  return (
    <div className="border p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold">Donate Tokens</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="number"
          min="0"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter IHRAM amount to donate"
          className="p-2 border rounded w-full"
          required
        />
        <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded-md">
          Submit Donation
        </button>
      </form>
    </div>
  );
}
