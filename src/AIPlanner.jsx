import { useState, useEffect } from "react";
import { ethers } from "ethers";

const tokenAddress = "0x2f4fb395cf2a622fae074f7018563494072d1d95";
const tokenABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export default function AiPlanner() {
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkBalance();
  }, []);

  async function checkBalance() {
    try {
      if (!window.ethereum) return;

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      const signer = web3Provider.getSigner();
      const userAddress = await signer.getAddress();

      const token = new ethers.Contract(tokenAddress, tokenABI, web3Provider);
      const [rawBalance, decimals] = await Promise.all([
        token.balanceOf(userAddress),
        token.decimals(),
      ]);
      const balance = Number(ethers.utils.formatUnits(rawBalance, decimals));
      setWallet(userAddress);
      setProvider(web3Provider);
      setHasAccess(balance >= 1000); // You hold 900M, so this should pass
    } catch (err) {
      console.error("Error checking balance", err);
    } finally {
      setChecking(false);
    }
  }

  async function handleAskAI() {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("https://ihram-ai.vercel.app", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      setResponse(data.reply || "No response.");
    } catch (err) {
      setResponse("Something went wrong while talking to the AI.");
      console.error(err);
    }

    setLoading(false);
  }

  async function handleFeedback() {
    alert("✅ Feedback submitted! Thank you.");
    setFeedback("");
  }

  if (checking) {
    return <div className="p-6 text-gray-600">🔄 Checking token balance...</div>;
  }

  if (!hasAccess) {
    return (
      <div className="p-6 text-red-600">
        ❌ You need at least <strong>1,000 IHRAM</strong> tokens to access this feature.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-700">Ihram AI Planner</h1>
      <p className="text-gray-700 mb-4">
        Ask about Umrah, Hajj, savings, token vesting, and more.
      </p>

      <textarea
        rows={4}
        placeholder="Ask your question..."
        className="w-full border p-3 rounded"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={handleAskAI}
        className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
      >
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {response && (
        <div className="mt-6 bg-gray-50 border p-4 rounded shadow">
          <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
        </div>
      )}

      {response && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-1">Suggest a correction:</p>
          <textarea
            rows={2}
            placeholder="Optional feedback to improve this answer"
            className="w-full border p-2 rounded text-sm"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button
            onClick={handleFeedback}
            className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            Submit Feedback
          </button>
        </div>
      )}
    </div>
  );
}
