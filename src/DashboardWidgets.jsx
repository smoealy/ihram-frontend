import { useEffect, useState } from "react";
import axios from "axios";

const TIER_SHEET = "https://opensheet.elk.sh/1eEZ3JR5-X0IxyCTYdo3gqTFNUBw2S3mTzkuoamUsuFw/Tiers";
const SETTINGS_SHEET = "https://opensheet.elk.sh/155ujeYEsQJHFQSXj_-zUZogBivkxp5CUtCjnWd1PWwM/Settings";

export default function DashboardWidgets() {
  const [tiers, setTiers] = useState([]);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        const [tiersRes, settingsRes] = await Promise.all([
          axios.get(TIER_SHEET),
          axios.get(SETTINGS_SHEET)
        ]);

        setTiers(tiersRes.data);
        const mappedSettings = {};
        settingsRes.data.forEach(entry => {
          mappedSettings[entry.type] = parseFloat(entry.amount);
        });
        setSettings(mappedSettings);
      } catch (err) {
        console.error("Failed to fetch sheet data:", err);
      }
    };

    fetchSheets();
  }, []);

  return (
    <div className="mt-10 space-y-6">
      <div className="border p-4 rounded-xl shadow bg-white">
        <h2 className="text-xl font-bold text-green-700 mb-2">🎁 Giveaway Settings</h2>
        {Object.keys(settings).map((type) => (
          <p key={type}><strong>{type}:</strong> ${settings[type]} = 1 Entry</p>
        ))}
      </div>

      <div className="border p-4 rounded-xl shadow bg-white">
        <h2 className="text-xl font-bold text-green-700 mb-2">🎟️ Redemption Tiers</h2>
        {tiers.map((tier, idx) => (
          <div key={idx} className="mb-2">
            <p><strong>{tier.Tier}</strong>: {tier.Tokens} IHRAM = {tier.Description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
