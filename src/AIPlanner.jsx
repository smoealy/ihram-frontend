import { useEffect, useState } from "react";
import ethers from "ethers";

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
  const [wallet, setWallet] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  useEffect(() => {
    async function checkBalance() {
      try {
        if (!window.ethereum) {
          console.warn("MetaMask not found");
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        setWallet(userAddress);

        const token = new ethers.Contract(tokenAddress, tokenABI, provider);
        const balance = await token.balanceOf(userAddress);
        const decimals = await token.decimals();
        const readableBalance = ethers.utils.formatUnits(balance, decimals);

        console.log("Detected balance:", readableBalance);
        setHasAccess(parseFloat(readableBalance) >= 1000);
      } catch (err) {
        console.error("Error checking balance:", err);
      } finally {
        setLoading(false);
      }
    }

    checkBalance();
  }, []);

  const handleAskAI = async () => {
    setResponse("Thinking...");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      setResponse(data.reply || "No response received.");
    } catch (err) {
      setResponse("❌ Failed to contact AI.");
    }
  };

  if (loading) return <p className="p-4 text-gray-500">Checking token balance...</p>;

  if (!hasAccess) {
    return (
      <div className="p-6 text-red-600 font-medium">
        ❌ You must hold at least <b>1,000 IHRAM</b> tokens to access the AI planner.
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-700">Ihram AI Planner</h1>
      <p className="text-gray-600">Ask questions about your Hajj or Umrah. Earn tokens by helping improve the AI.</p>

      <textarea
        className="w-full border p-3 rounded text-sm"
        rows={4}
        placeholder="Ask about Umrah, Hajj, planning, or pricing..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={handleAskAI}
        className="mt-3 bg-green-700 text-white px-5 py-2 rounded hover:bg-green-800"
      >
        Ask AI
      </button>

      {response && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <p className="font-semibold text-gray-700 mb-2">AI Response:</p>
          <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </main>
  );
}
