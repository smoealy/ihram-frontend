import { useEffect, useState } from "react";
import { ethers } from "ethers";

const tokenAddress = "0x2f4fb395cf2a622fae074f7018563494072d1d95";
const tokenABI = [
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function AiPlanner() {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function checkBalance() {
      try {
        if (!window.ethereum) {
          alert("Please install MetaMask");
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum); // ✅ Ethers v5
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        const token = new ethers.Contract(tokenAddress, tokenABI, provider);
        const balance = await token.balanceOf(address);
        const decimals = await token.decimals();

        const readable = Number(ethers.utils.formatUnits(balance, decimals));
        console.log("Balance check:", readable);
        setHasAccess(readable >= 1000); // Set your threshold here
      } catch (err) {
        console.error("Error checking balance", err);
      } finally {
        setLoading(false);
      }
    }

    checkBalance();
  }, []);

  async function askAI() {
    setResponse("Thinking...");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      setResponse(data.reply || "No response received.");
    } catch (err) {
      setResponse("Error talking to AI.");
    }
  }

  async function sendFeedback() {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        response,
        correction: feedback
      })
    });
    const msg = await res.text();
    alert(msg === "ok" ? "✅ Feedback submitted!" : "❌ Something went wrong.");
    setFeedback("");
  }

  if (loading) return <div className="p-6">⏳ Checking your IHRAM balance...</div>;

  if (!hasAccess) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        ❌ You need at least <strong>1,000 IHRAM</strong> tokens to access this AI.
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-700">Ihram AI Planner</h1>
      <p className="text-gray-600">
        Ask anything about your Hajj or Umrah journey. Get personalized AI support.
      </p>

      <textarea
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-3 border rounded"
        placeholder="Ask about rituals, visas, packing, token utility..."
      />

      <button
        onClick={askAI}
        className="mt-2 px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800"
      >
        Ask AI
      </button>

      {response && (
        <div className="bg-gray-100 p-4 mt-4 rounded">
          <h3 className="font-semibold text-gray-700 mb-2">AI Response:</h3>
          <p className="whitespace-pre-wrap text-gray-800">{response}</p>
        </div>
      )}

      {response && (
        <div className="mt-6">
          <h4 className="text-sm text-gray-700 mb-1">Suggest a correction (Train-to-Earn):</h4>
          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="How can this response be improved?"
          />
          <button
            onClick={sendFeedback}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit Feedback
          </button>
        </div>
      )}
    </main>
  );
}
