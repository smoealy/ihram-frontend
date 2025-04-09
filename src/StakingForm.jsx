import { useState } from "react";
import { ethers } from "ethers";

const stakingWallet = "0x5daF1e681985F3e0AeC90a2A96062C5f632833e9";
const tokenAddress = "0x2f4fb395cf2a622fae074f7018563494072d1d95";
const tokenABI = ["function transfer(address to, uint256 amount) public returns (bool)"];

export default function StakingForm() {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const handleStake = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");

    try {
      setStatus("Processing...");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const token = new ethers.Contract(tokenAddress, tokenABI, signer);

      const parsed = ethers.utils.parseUnits(amount, 18);
      const tx = await token.transfer(stakingWallet, parsed);
      await tx.wait();

      setStatus(`✅ Successfully staked ${amount} IHRAM`);
      setAmount("");
    } catch (err) {
      console.error(err);
      setStatus("❌ Staking failed. Please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 border rounded-xl p-4 shadow-md">
      <h2 className="text-2xl font-bold mb-4">Stake IHRAM Tokens</h2>
      {status && <p className="text-blue-600 mb-2">{status}</p>}
      <div className="flex items-center space-x-4">
        <input
          type="number"
          placeholder="Amount to stake"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button onClick={handleStake} className="bg-green-600 text-white px-4 py-2 rounded">
          Stake
        </button>
      </div>
    </div>
  );
}
