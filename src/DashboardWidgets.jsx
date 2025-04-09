import { useEffect, useState } from "react";
import RedemptionForm from "./RedemptionForm";

export default function DashboardWidgets() {
  const [settings, setSettings] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("https://opensheet.elk.sh/155ujeYEsQJHFQSXj_-zUZogBivkxp5CUtCjnWd1PWwM/Settings")
      .then((res) => res.json())
      .then((data) => {
        const s = {};
        data.forEach((item) => {
          s[item.Parameter] = item.Value;
        });
        setSettings(s);
      });
  }, []);

  if (!settings) return null;

  return (
    <div className="space-y-6 mt-6">
      <div className="border p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-2">🎁 Giveaway Entry Settings</h2>
        <p>Staking: ${settings.Giveaway_Entry_Staking_USD} = 1 Entry</p>
        <p>Donation: ${settings.Giveaway_Entry_Donation_USD} = 1 Entry</p>
        <p>Redemption: {settings.Giveaway_Entry_Redemption_Count} Form = 1 Entry</p>
        <p>Minimum to Redeem: {settings.Redeem_Minimum_Tokens} IHRAM</p>
      </div>

      <div className="border p-4 rounded-xl shadow">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-700 text-white px-4 py-2 rounded-md w-full"
        >
          {showForm ? "Close Redemption Form" : "🕋 Redeem IHRAM for Umrah"}
        </button>
        {showForm && <RedemptionForm />}
      </div>
    </div>
  );
}
