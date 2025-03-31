// Ihram Token Frontend with Admin Panel
import { useState, useEffect } from "react";
import * as ethers from "ethers";

const tokenAddress = "0x2f4fb395cf2a622fae074f7018563494072d1d95";
const tokenSaleAddress = "0xdB2D5EaC33846FC5Cf85C3c597C723079C0eB68D";
const vestingAddress = "0xc126489BA66D7b0Dc06F5a4962778e25d2912Ba4";
const routerAddress = "0xAd42230785b8f66523Bd1A00967cB289cbb6AeAC";
const usdcAddress = "0xbdb64f882e1038168dfdb1d714a6f4061dd6a3f8";

const tokenSaleABI = [
  "function buyTokens() payable",
  "function withdrawUnsoldTokens()",
  "function owner() view returns (address)"
];
const vestingABI = [
  "function claim()",
  "function getClaimableAmount(address) view returns (uint256)"
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

  const buyTokens = async () => {
    if (!provider) return;
    const signer = provider.getSigner();
    const sale = new ethers.Contract(tokenSaleAddress, tokenSaleABI, signer);
    try {
      const tx = await sale.buyTokens({ value: ethers.utils.parseEther("0.01") });
      await tx.wait();
      alert("Tokens purchased successfully");
      fetchBalance();
    } catch (e) {
      alert("Transaction failed");
      console.error(e);
    }
  };

  const claim = async () => {
    if (!provider) return;
    const signer = provider.getSigner();
    const vest = new ethers.Contract(vestingAddress, vestingABI, signer);
    try {
      const tx = await vest.claim();
      await tx.wait();
      alert("Claim successful");
      fetchBalance();
      fetchClaimable();
    } catch (e) {
      alert("Claim failed");
      console.error(e);
    }
  };

  const withdrawUnsoldTokens = async () => {
    if (!provider) return;
    const signer = provider.getSigner();
    const sale = new ethers.Contract(tokenSaleAddress, tokenSaleABI, signer);
    try {
      const tx = await sale.withdrawUnsoldTokens();
      await tx.wait();
      alert("Withdrawal successful");
    } catch (e) {
      alert("Withdraw failed");
      console.error(e);
    }
  };

  useEffect(() => {
    if (wallet && provider) {
      fetchTokenPrice();
      fetchBalance();
      fetchClaimable();
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
          <button onClick={buyTokens} className="bg-blue-600 text-white px-4 py-2 rounded-md mt-2">
            Buy for 0.01 ETH
          </button>
        </div>

        <div className="border p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold">My Balance</h2>
          <p>{balance ?? "..."} IHRAM</p>
        </div>

        <div className="border p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold">Claimable Tokens</h2>
          <p>{claimable ?? "..."} IHRAM</p>
          <button onClick={claim} className="bg-yellow-500 text-white px-4 py-2 rounded-md mt-2">
            Claim Tokens
          </button>
        </div>

        {isOwner && (
          <div className="border p-4 rounded-xl shadow bg-gray-50">
            <h2 className="text-xl font-semibold text-red-600">Admin Panel</h2>
            <p className="text-sm text-gray-600 mb-2">You are the contract owner.</p>
            <button onClick={withdrawUnsoldTokens} className="bg-red-600 text-white px-4 py-2 rounded-md">
              Withdraw Unsold Tokens
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
