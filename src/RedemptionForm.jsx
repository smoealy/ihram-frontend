import { useState } from "react";

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

  const [submitted, setSubmitted] = useState(false);

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
    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbwl1PZvvSbkvR6-0jLHEEQ4iyNDa_E-DNsW9xQS1ijVI60mk3q2rwaeIKbWyfPs3Ru6/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      setSubmitted(true);
    } catch (error) {
      alert("Something went wrong. Try again.");
      console.error("Submission error:", error);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-green-700">🎉 Thank you!</h2>
        <p>Your redemption form has been submitted.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 border rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Umrah Redemption Form</h2>
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
              className={`px-4 py-2 rounded-md border ${formData.tier === tier ? "bg-green-600 text-white" : "bg-white"}`}
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
