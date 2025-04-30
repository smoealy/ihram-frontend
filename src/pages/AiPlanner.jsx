// src/pages/AiPlanner.jsx

import { useEffect, useState } from "react";
import { ethers } from "ethers";

const IHRAM_TOKEN_ADDRESS = "0x2f4fb395cf2a622fae074f7018563494072d1d95";
const IHRAM_TOKEN_ABI = ["function balanceOf(address) view returns (uint256)"];

export default function AiPlanner() {
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [eligible, setEligible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethProvider);
      setWallet(accounts[0]);
    } catch (err) {
      setError("Failed to connect wallet.");
      console.error(err);
    }
  };

  const checkEligibility = async () => {
    if (!provider || !wallet) return;
    try {
      setLoading(true);
      const signer = provider.getSigner();
      const token = new ethers.Contract(IHRAM_TOKEN_ADDRESS, IHRAM_TOKEN_ABI, signer);
      const balance = await token.balanceOf(wallet);
      const readable = parseFloat(ethers.utils.formatUnits(balance, 18));
      setEligible(readable >= 1000);
      setLoading(false);
    } catch (err) {
      setError("Error checking token balance.");
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet && provider) checkEligibility();
  }, [wallet]);

  return (
    <div className="min-h-screen bg-white p-6 text-center text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-green-700">🧠 Ihram AI Planner</h1>

      {!wallet ? (
        <button
          onClick={connectWallet}
          className="px-6 py-3 bg-green-700 text-white rounded shadow hover:bg-green-800"
        >
          Connect Wallet
        </button>
      ) : loading ? (
        <p>🔄 Checking your IHRAM balance...</p>
      ) : eligible ? (
        <div className="w-full h-[80vh] mt-4">
          <iframe
            src="https://ihram-ai.vercel.app/"
            className="w-full h-full border-0 rounded-xl"
            allow="clipboard-write"
            title="Ihram AI Chat"
          ></iframe>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-red-600 font-semibold">
            ❌ You need at least 1000 IHRAM tokens to access the AI Planner.
          </p>
          <p className="text-sm text-gray-500 mt-2">Your wallet: {wallet}</p>
        </div>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
