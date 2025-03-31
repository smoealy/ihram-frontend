// Ihram Token Frontend with Admin + Vesting + Community Dashboard
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const tokenAddress = "0x2f4fb395cf2a622fae074f7018563494072d1d95";
const tokenSaleAddress = "0xdB2D5EaC33846FC5Cf85C3c597C723079C0eB68D";
const vestingAddress = "0xc126489BA66D7b0Dc06F5a4962778e25d2912Ba4";
const routerAddress = "0xAd42230785b8f66523Bd1A00967cB289cbb6AeAC";
const usdcAddress = "0xbdb64f882e1038168dfdb1d714a6f4061dd6a3f8";
const etherscanAPIKey = "ASPJKQQ3S5S6MCF4NI54Q8A6PFYWFWFBW1";

const tokenSaleABI = [
  "function buyTokens() payable",
  "function withdrawUnsoldTokens()",
  "function updateRate(uint256)",
  "function toggleSale()",
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
  const [newRate, setNewRate] = useState("");
  const [vestingInfo, setVestingInfo] = useState(null);
  const [holders, setHolders] = useState([]);

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

  const fetchVesting = async () => {
    if (!provider || !wallet) return;
    const signer = provider.getSigner();
    const vest = new ethers.Contract(vestingAddress, vestingABI, signer);
    const sched = await vest.schedules(wallet);
    const claimableAmount = await vest.getClaimableAmount(wallet);
    setVestingInfo({
      total: sched.totalAmount,
      released: sched.releasedAmount,
      start: sched.startTime,
      cliff: sched.cliffDuration,
      duration: sched.vestingDuration,
      claimable: claimableAmount
    });
  };

  const fetchCommunity = async () => {
    try {
      const res = await fetch(`https://api-sepolia.etherscan.io/api?module=token&action=tokenholderlist&contractaddress=${tokenAddress}&page=1&offset=100&apikey=${etherscanAPIKey}`);
      const data = await res.json();
      if (data.result) {
        const sorted = data.result.sort((a, b) => parseFloat(b.TokenHolderQuantity) - parseFloat(a.TokenHolderQuantity));
        setHolders(sorted);
      }
    } catch (e) {
      console.error("Failed to fetch holders:", e);
    }
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
      fetchVesting();
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

  const updateTokenRate = async () => {
    if (!provider || !newRate || isNaN(newRate)) return alert("Enter a valid rate");
    const signer = provider.getSigner();
    const sale = new ethers.Contract(tokenSaleAddress, tokenSaleABI, signer);
    try {
      const tx = await sale.updateRate(newRate);
      await tx.wait();
      alert("Rate updated successfully");
      setNewRate("");
    } catch (e) {
      alert("Update rate failed");
      console.error(e);
    }
  };

  const toggleSale = async () => {
    if (!provider) return;
    const signer = provider.getSigner();
    const sale = new ethers.Contract(tokenSaleAddress, tokenSaleABI, signer);
    try {
      const tx = await sale.toggleSale();
      await tx.wait();
      alert("Sale toggled successfully");
    } catch (e) {
      alert("Toggle failed");
      console.error(e);
    }
  };

  useEffect(() => {
    if (wallet && provider) {
      fetchTokenPrice();
      fetchBalance();
      fetchClaimable();
      fetchVesting();
      fetchCommunity();
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

        {vestingInfo && (
          <div className="border p-4 rounded-xl shadow bg-gray-50">
            <h2 className="text-xl font-semibold text-purple-700">Vesting Schedule</h2>
            <p>Total: {ethers.utils.formatUnits(vestingInfo.total, 18)} IHRAM</p>
            <p>Released: {ethers.utils.formatUnits(vestingInfo.released, 18)} IHRAM</p>
            <p>Cliff: {new Date((vestingInfo.start + vestingInfo.cliff) * 1000).toLocaleString()}</p>
            <p>End: {new Date((vestingInfo.start + vestingInfo.duration) * 1000).toLocaleString()}</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div
                className="bg-purple-600 h-3 rounded-full"
                style={{ width: `${(Number(vestingInfo.released) / Number(vestingInfo.total)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {holders.length > 0 && (
          <div className="border p-4 rounded-xl shadow bg-white">
            <h2 className="text-xl font-semibold text-blue-700">Community Dashboard</h2>
            <p className="mb-2 text-sm">Total Holders: {holders.length}</p>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Address</th>
                  <th className="text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {holders.slice(0, 10).map((holder, idx) => (
                  <tr key={idx} className="border-t">
                    <td>{holder.TokenHolderAddress.slice(0, 6)}...{holder.TokenHolderAddress.slice(-4)}</td>
                    <td className="text-right">{parseFloat(holder.TokenHolderQuantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isOwner && (
          <div className="border p-4 rounded-xl shadow bg-gray-50">
            <h2 className="text-xl font-semibold text-red-600">Admin Panel</h2>
            <p className="text-sm text-gray-600 mb-4">You are the contract owner.</p>

            <div className="mb-3">
              <button onClick={toggleSale} className="bg-orange-500 text-white px-4 py-2 rounded-md mr-2">
                Toggle Sale
              </button>
              <button onClick={withdrawUnsoldTokens} className="bg-red-600 text-white px-4 py-2 rounded-md">
                Withdraw Unsold Tokens
              </button>
            </div>

            <div className="mb-2">
              <input
                type="number"
                placeholder="New token rate (per ETH)"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                className="p-2 border rounded-md mr-2"
              />
              <button onClick={updateTokenRate} className="bg-blue-600 text-white px-4 py-2 rounded-md">
                Update Rate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
