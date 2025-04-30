import { useState, useEffect } from "react";
import { ethers } from "ethers";

const IHRAM_TOKEN_ADDRESS = "0x2f4fb395cf2a622fae074f7018563494072d1d95";
const IHRAM_TOKEN_ABI = ["function balanceOf(address) view returns (uint256)"];
const AI_URL = "https://ihram-ai.vercel.app/";

export default function AiPlanner() {
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [eligible, setEligible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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
      if (readable >= 1000) {
        setEligible(true);
        if (isMobile) {
          window.location.href = AI_URL;
        }
      } else {
        setEligible(false);
      }
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

  if (eligible && !isMobile) {
    return (
      <div className="w-full h-screen">
        <iframe
          src={AI_URL}
          className="w-full h-full border-0"
          allow="clipboard-write"
          title="Ihram AI Chat"
        ></iframe>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-center text-gray-800 p-6">
      <h1 className="text-3xl font-bold mb-6 text-green-700">🧠 Ihram AI Planner</h1>

      {!wallet ? (
        <button
          onClick={connectWallet}
          className="px-6 py-3 bg-green-700 text-white rounded hover:bg-green-800"
        >
          Connect Wallet
        </button>
      ) : loading ? (
        <p>🔄 Checking your IHRAM token balance...</p>
      ) : eligible ? (
        isMobile ? (
          <p className="text-green-600 font-semibold">✅ Redirecting to Ihram AI...</p>
        ) : (
          <p className="text-green-600 font-semibold">✅ Loading AI Planner...</p>
        )
      ) : (
        <p className="text-red-600 font-semibold">
          ❌ You need at least 1000 IHRAM tokens to access the AI Planner.
        </p>
      )}

      {wallet && (
        <p className="text-xs text-gray-500 mt-4">Connected: {wallet}</p>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
