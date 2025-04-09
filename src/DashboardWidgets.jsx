// DashboardWidgets.jsx (Updated with Redeem Button, Corrected Display, Coming Soon: Staking & Donation)

import { useState, useEffect } from 'react';

export default function DashboardWidgets() {
  const [settings, setSettings] = useState(null);
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const settingsRes = await fetch('https://opensheet.elk.sh/155ujeYEsQJHFQSXj_-zUZogBivkxp5CUtCjnWd1PWwM/Settings');
      const tiersRes = await fetch('https://opensheet.elk.sh/1eEZ3JR5-X0IxyCTYdo3gqTFNUBw2S3mTzkuoamUsuFw/Tiers');
      const settingsData = await settingsRes.json();
      const tiersData = await tiersRes.json();
      setSettings(settingsData[0]);
      setTiers(tiersData);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 mt-10">
      <div className="border p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-2">🎁 Giveaway Entry Settings</h2>
        {settings ? (
          <ul className="space-y-1">
            <li>Staking: ${settings.Giveaway_Entry_Staking_USD} = 1 Entry</li>
            <li>Donation: ${settings.Giveaway_Entry_Donation_USD} = 1 Entry</li>
            <li>Redemption: {settings.Giveaway_Entry_Redemption_Count} redemption(s) = 1 Entry</li>
            <li>Minimum Tokens to Redeem: {settings.Redeem_Minimum_Tokens} IHRAM</li>
          </ul>
        ) : (
          <p>Loading settings...</p>
        )}
      </div>

      <div className="border p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">🏷️ Redemption Tiers</h2>
        {tiers.length > 0 ? (
          <ul className="space-y-4">
            {tiers.map((tier, index) => (
              <li key={index} className="border rounded-lg p-3 bg-gray-50">
                <p className="font-semibold">{tier["Tier Name"]}: {tier["Token Price"]} IHRAM — {tier.Description}</p>
                <p className="text-sm text-gray-500 italic">{tier.Notes}</p>
                <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded" onClick={() => alert('Redemption form coming soon.')}>Redeem</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading tiers...</p>
        )}
      </div>

      {/* COMING SOON */}
      <div className="border p-4 rounded-xl shadow opacity-60">
        <h2 className="text-xl font-bold mb-2">📥 Staking & 💝 Donations</h2>
        <p className="text-sm">Coming soon: Stake tokens or donate to earn entries and rewards.</p>
      </div>
    </div>
  );
}
