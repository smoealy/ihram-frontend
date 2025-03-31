// Ihram Token Frontend (React + Vite + Tailwind)
// Step-by-step deployment coming after code

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const tokenAddress = "0x2f4fb395cf2a622fae074f7018563494072d1d95";
const tokenSaleAddress = "0xdB2D5EaC33846FC5Cf85C3c597C723079C0eB68D";
const vestingAddress = "0xc126489BA66D7b0Dc06F5a4962778e25d2912Ba4";
const routerAddress = "0xAd42230785b8f66523Bd1A00967cB289cbb6AeAC";
const usdcAddress = "0xbdb64f882e1038168dfdb1d714a6f4061dd6a3f8";

// Minimal ABIs
const tokenSaleABI = ["function buyTokens() payable"];
const vestingABI = ["function claim()", "function getClaimableAmount(address) view returns (uint256)"];
const tokenABI = ["function balanceOf(address) view returns (uint256)"];
const routerABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)"
];

export default function Home() {
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [price, setPrice] = useState(null);
  const [balance, setBalance] = useState(null);
  const [claimable, setClaimable] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
    setWallet(accounts[0]);
    setProvider(ethersProvider);
  };

  const fetchTokenPrice = async () => {
    const signer = provider.getSigner();
    const router = new ethers.Contract(routerAddress, routerABI, signer);
    const path = [tokenAddress, usdcAddress];
    const amounts = await router.getAmountsOut(ethers.utils.parseUnits("1", 18), path);
    setPrice(ethers.utils.formatUnits(amounts[1], 18));
  };

  const fetchBalance = async () => {
    const signer = provider.getSigner();
    const token = new ethers.Contract(tokenAddress, tokenABI, signer);
    const bal = await token.balanceOf(wallet);
    setBalance(ethers.utils.formatUnits(bal, 18));
  };

  const fetchClaimable = async () => {
    const signer = provider.getSigner();
    const vest = new ethers.Contract(vestingAddress, vestingABI, signer);
    const amount = await vest.getClaimableAmount(wallet);
    setClaimable(ethers.utils.formatUnits(amount, 18));
  };

  const buyTokens = async () => {
    const signer = provider.getSigner();
    const sale = new ethers.Contract(tokenSaleAddress, tokenSaleABI, signer);
    await sale.buyTokens({ value: ethers.utils.parseEther("0.01") });
  };

  const claim = async () => {
    const signer = provider.getSigner();
    const vest = new ethers.Contract(vestingAddress, vestingABI, signer);
    await vest.claim();
  };

  useEffect(() => {
    if (wallet && provider) {
      fetchTokenPrice();
      fetchBalance();
      fetchClaimable();
    }
  }, [wallet]);

  return (
    <div className="min-h-screen bg-white text-gray-800 p-4 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-center text-green-700">Ihram Token Dashboard</h1>

        <div className="flex justify-center">
          <Button onClick={connectWallet}>{wallet ? "Connected" : "Connect Wallet"}</Button>
        </div>

        <Card>
          <CardContent className="space-y-2">
            <h2 className="text-xl font-semibold">Price</h2>
            <p>1 IHRAM = {price ?? "..."} USDC</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2">
            <h2 className="text-xl font-semibold">Buy Tokens</h2>
            <Button onClick={buyTokens}>Buy for 0.01 ETH</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2">
            <h2 className="text-xl font-semibold">My Balance</h2>
            <p>{balance ?? "..."} IHRAM</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2">
            <h2 className="text-xl font-semibold">Claimable Tokens</h2>
            <p>{claimable ?? "..."} IHRAM</p>
            <Button onClick={claim}>Claim</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
