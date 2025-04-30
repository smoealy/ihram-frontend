import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { askAI } from "../api/chat";

const tokenAddress = "0x2f4fb395cf2a622fae074f7018563494072d1d95";
const tokenABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
];

export default function PlannerAI() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!window.ethereum) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      const contract = new ethers.Contract(tokenAddress, tokenABI, provider);
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      const humanBalance = ethers.utils.formatUnits(balance, decimals);

      setHasAccess(parseFloat(humanBalance) >= 1000);
      setLoading(false);
    };

    checkAccess();
  }, []);

  const handleAsk = async () => {
    setResponse("Thinking...");
    const answer = await askAI([{ role: "user", content: prompt }]);
    setResponse(answer);
  };

  const handleFeedback = async () => {
    alert("Feedback submitted! (stub)");
    setFeedback("");
  };

  if (loading) return <p>⏳ Checking token balance...</p>;

  if (!hasAccess) return <p className="text-red-600">❌ 1,000+ IHRAM tokens required to access the AI.</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold text-green-700">Ihram AI Planner</h1>
      <p className="text-gray-600">Ask anything about your pilgrimage, and train the AI for rewards.</p>

      <textarea
        rows={4}
        className="w-full border p-3 rounded"
        placeholder="Ask a question..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button onClick={handleAsk} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">
        Ask AI
      </button>

      {response && (
        <div className="bg-gray-100 p-4 rounded shadow">
          <h2 className="font-bold">AI Response:</h2>
          <p>{response}</p>
        </div>
      )}

      {response && (
        <div>
          <textarea
            className="w-full border p-2 rounded mt-4"
            placeholder="Suggest a better response..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button onClick={handleFeedback} className="mt-2 bg-blue-600 text-white px-4 py-1 rounded">
            Submit Feedback
          </button>
        </div>
      )}
    </div>
  );
}
