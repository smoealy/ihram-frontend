import { useState } from "react";
import { ethers } from "ethers";
import { WALLET_ADDRESSES } from "./wallets";

const tokenAddress = "0x2f4fb395cf2a622fae074f7018563494072d1d95";
const webhookURL = "https://script.google.com/macros/s/AKfycbzB8BPZi5OOAs-xlHXPrqaf28WH1lpZxD94XHrxNT2neAmtRborYatVyuWw7h7wQOr1/exec";
const DONATION_ENTRY_USD = 150;

const tokenABI = ["function transfer(address to, uint256 amount) public returns (bool)"];

export default function DonationForm() {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const handleDonate = async () => {
    try {
      if (!window.ethereum) throw new Error("Wallet not found");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      const token = new ethers.Contract(tokenAddress, tokenABI, signer);

      const tokenAmount = ethers.utils.parseUnits(amount, 18);
      const tx = await token.transfer(WALLET_ADDRESSES.donation, tokenAmount);
      await tx.wait();

      const entries = Math.floor(parseFloat(amount) / DONATION_ENTRY_USD);

      const data = {
        Action: "Donation",
        Wallet: userAddress,
        Amount: amount,
        Entries: entries,
      };

      await fetch(webhookURL, {
        method: "POST",
        mode: "cors", // Required for CORS on Google Apps Script
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      setStatus("✅ Donation sent and entry submitted!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Donation failed. Please try again.");
    }
  };

  return (
    <div className="border p-4 rounded-xl shadow-md mt-6">
      <h2 className="text-xl font-semibold">Donate IHRAM</h2>
      {status && <p className="text-blue-600 text-sm mt-1">{status}</p>}
      <div className="flex gap-2 mt-2">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <button onClick={handleDonate} className="bg-yellow-500 text-white px-4 py-2 rounded">
          Donate
        </button>
      </div>
    </div>
  );
}
