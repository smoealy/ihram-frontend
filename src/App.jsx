// Ihram Token Frontend (Updated for New TokenSale Contract)
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const tokenAddress = "0x2f4fb395cf2a622fae074f7018563494072d1d95";
const tokenSaleAddress = "0xa703b6393b0caf374cb7ebe2eb760bb372f38d82"; // UPDATED
const vestingAddress = "0xc126489BA66D7b0Dc06F5a4962778e25d2912Ba4";
const routerAddress = "0xAd42230785b8f66523Bd1A00967cB289cbb6AeAC";
const usdcAddress = "0xbdb64f882e1038168dfdb1d714a6f4061dd6a3f8";
const etherscanAPIKey = "ASPJKQQ3S5S6MCF4NI54Q8A6PFYWFWFBW1";

const tokenSaleABI = [
  "function buyTokens() payable",
  "function configureRound(uint256,uint256,uint256,uint256,uint256,address)",
  "function activateRound(uint256)",
  "function getCurrentRound() view returns (tuple(bool active,uint256 rate,uint256 minContribution,uint256 maxContribution,uint256 cap,uint256 raised,address vestingAddress))",
  "function owner() view returns (address)"
];
const vestingABI = [
  "function claim()",
  "function getClaimableAmount(address) view returns (uint256)",
  "function schedules(address) view returns (uint256 totalAmount, uint256 releasedAmount, uint256 startTime, uint256 cliffDuration, uint256 vestingDuration)"
];
const tokenABI = ["function balanceOf(address) view returns (uint256)"];
const routerABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)"
];

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [price, setPrice] = useState(null);
  const [balance, setBalance] = useState(null);
  const [claimable, setClaimable] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [holders, setHolders] = useState([]);
  const [ethAmount, setEthAmount] = useState("0.01");

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
    setWallet(accounts[0]);
    setProvider(ethersProvider);
  };

  const checkOwnership = async () => {
    if (!provider || !wallet) return;
    const signer = provider.getSigner();
    const sale = new ethers.Contract(tokenSaleAddress, tokenSaleABI, signer);
    const contractOwner = await sale.owner();
    setIsOwner(contractOwner.toLowerCase() === wallet.toLowerCase());
  };

  const fetchTokenPrice = async () => {
    if (!provider || !wallet) return;
    const signer = provider.getSigner();
    const router = new ethers.Contract(routerAddress, routerABI, signer);
    const path = [tokenAddress, usdcAddress];
    try {
      const amounts = await router.getAmountsOut(ethers.utils.parseUnits("1", 18), path);
      setPrice(ethers.utils.formatUnits(amounts[1], 18));
    } catch (e) {
      console.error("Price fetch failed:", e);
    }
  };

  const fetchBalance = async () => {
    if (!provider || !wallet) return;
    const signer = provider.getSigner();
    const token = new ethers.Contract(tokenAddress, tokenABI, signer);
    const bal = await token.balanceOf(wallet);
    setBalance(ethers.utils.formatUnits(bal, 18));
  };

  const fetchClaimable = async () => {
    if (!provider || !wallet) return;
    const signer = provider.getSigner();
    const vest = new ethers.Contract(vestingAddress, vestingABI, signer);
    const amount = await vest.getClaimableAmount(wallet);
    setClaimable(ethers.utils.formatUnits(amount, 18));
  };

  const fetchVesting = async () => {
    if (!provider || !wallet) return;
    const signer = provider.getSigner();
    const vest = new ethers.Contract(vestingAddress, vestingABI, signer);
    const sched = await vest.schedules(wallet);
    setClaimable(ethers.utils.formatUnits(await vest.getClaimableAmount(wallet), 18));
  };

  const buyTokens = async () => {
    if (!provider) return;
    const signer = provider.getSigner();
    const sale = new ethers.Contract(tokenSaleAddress, tokenSaleABI, signer);
    try {
      const tx = await sale.buyTokens({ value: ethers.utils.parseEther(ethAmount || "0.01") });
      await tx.wait();
      alert("Tokens purchased successfully");
      fetchBalance();
    } catch (e) {
      alert("Transaction failed");
      console.error(e);
    }
  };

  useEffect(() => {
    if (wallet && provider) {
      fetchTokenPrice();
      fetchBalance();
      fetchClaimable();
      fetchVesting();
      checkOwnership();
    }
  }, [wallet]);

  return (
    <div className="min-h-screen bg-white text-gray-800 p-4 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-center text-green-700">Ihram Token Dashboard</h1>

        <div className="flex justify-center">
          <button onClick={connectWallet} className="bg-green-600 text-white px-4 py-2 rounded-md">
            {wallet ? wallet.slice(0, 6) + "..." + wallet.slice(-4) : "Connect Wallet"}
          </button>
        </div>

        <div className="border p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold">Price</h2>
          <p>1 IHRAM = {price ?? "..."} USDC</p>
        </div>

        <div className="border p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold">Buy Tokens</h2>
          <input
            type="number"
            step="0.001"
            placeholder="Enter ETH amount"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            className="p-2 border rounded-md mr-2"
          />
          <button onClick={buyTokens} className="bg-blue-600 text-white px-4 py-2 rounded-md mt-2">
            Buy for {ethAmount || "0.01"} ETH
          </button>
        </div>

        <div className="border p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold">My Balance</h2>
          <p>{balance ?? "..."} IHRAM</p>
        </div>

        <div className="border p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold">Claimable Tokens</h2>
          <p>{claimable ?? "..."} IHRAM</p>
          {/* Optional claim button if vesting applies */}
        </div>

        {isOwner && (
          <div className="border p-4 rounded-xl shadow bg-gray-50">
            <h2 className="text-xl font-semibold text-red-600">Admin Panel</h2>
            <p className="text-sm text-gray-600 mb-4">You are the contract owner.</p>
            <p className="text-sm text-gray-600">Use Remix or Etherscan to configure rounds or manage the sale.</p>
          </div>
        )}
      </div>
    </div>
  );
}
