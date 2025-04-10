import { useState } from "react";
import { ethers } from "ethers";

const redemptionWallet = "0xACec56E1Ec695B4aCfC4e1765f3278ab7d73e1a9";
const tokenAddress = "0x2f4fb395cf2a622fae074f7018563494072d1d95";
const webhookURL = "https://script.google.com/macros/s/AKfycbzB8BPZi5OOAs-xlHXPrqaf28WH1lpZxD94XHrxNT2neAmtRborYatVyuWw7h7wQOr1/exec";

const tokenABI = ["function transfer(address to, uint256 amount) public returns (bool)"];

export default function RedemptionForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nationality: "",
    departureCity: "",
    arrivalCity: "",
    privateCar: "No",
    pilgrims: 1,
    children: 0,
    infants: 0,
    hotelType: "3",
    arrivalDate: "",
    nightsMakkah: 3,
    nightsMadinah: 3,
    tier: "Bronze",
  });
  const [status, setStatus] = useState("");

  const tiers = {
    Bronze: 500,
    Silver: 750,
    Gold: 1000,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Submitting...");

    try {
      if (!window.ethereum) throw new Error("Wallet not detected");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      const token = new ethers.Contract(tokenAddress, tokenABI, signer);
      const amount = ethers.utils.parseUnits(tiers[formData.tier].toString(), 18);

      const tx = await token.transfer(redemptionWallet, amount);
      await tx.wait();

      const sheetData = {
        Name: formData.name,
        "Email/Phone": formData.email,
        Nationality: formData.nationality,
        "Departure City": formData.departureCity,
        "Arrival City": formData.arrivalCity,
        "Private Car": formData.privateCar,
        Pilgrims: formData.pilgrims,
        Children: formData.children,
        Infants: formData.infants,
        "Hotel Type": formData.hotelType,
        "Arrival Date": formData.arrivalDate,
        "Nights Makkah": formData.nightsMakkah,
        "Nights Madinah": formData.nightsMadinah,
        Tier: formData.tier,
        Wallet: userAddress,
        Tokens: tiers[formData.tier],
      };

      await fetch(webhookURL, {
        method: "POST",
        body: JSON.stringify(sheetData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      setStatus("✅ Redemption submitted! UmrahCompanions team will contact you.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to redeem. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 border rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Umrah Redemption Form</h2>
      {status && <p className="mb-2 text-sm text-blue-700">{status}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Name" onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="email" placeholder="Email or Phone" onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="nationality" placeholder="Country of Nationality" onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="departureCity" placeholder="Departure City" onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="arrivalCity" placeholder="Arrival City" onChange={handleChange} className="w-full p-2 border rounded" required />

        <label className="block">Need Private Car?</label>
        <select name="privateCar" onChange={handleChange} className="w-full p-2 border rounded">
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>

        <label className="block">Number of Pilgrims</label>
        <input name="pilgrims" type="number" min="1" onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="children" type="number" placeholder="Children" onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="infants" type="number" placeholder="Infants" onChange={handleChange} className="w-full p-2 border rounded" />

        <label className="block">Hotel Type (1 to 5 stars)</label>
        <select name="hotelType" onChange={handleChange} className="w-full p-2 border rounded">
          <option value="1">1 Star</option>
          <option value="2">2 Stars</option>
          <option value="3">3 Stars</option>
          <option value="4">4 Stars</option>
          <option value="5">5 Stars</option>
        </select>

        <input name="arrivalDate" type="date" onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="nightsMakkah" type="number" placeholder="Nights in Makkah" onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="nightsMadinah" type="number" placeholder="Nights in Madinah" onChange={handleChange} className="w-full p-2 border rounded" required />

        <label className="block font-semibold mt-4">Select Package Tier</label>
        <div className="flex space-x-4">
          {Object.keys(tiers).map((tier) => (
            <button
              key={tier}
              type="button"
              className={`px-4 py-2 rounded-md border ${
                formData.tier === tier ? "bg-green-600 text-white" : "bg-white"
              }`}
              onClick={() => setFormData((prev) => ({ ...prev, tier }))}
            >
              {tier} ({tiers[tier]} IHRAM)
            </button>
          ))}
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md mt-4">
          Redeem Package
        </button>
      </form>
    </div>
  );
}
