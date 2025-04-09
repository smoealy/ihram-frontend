import { useEffect, useState } from "react";
import axios from "axios";

// Replace these with your OpenSheet URLs (make sure your sheets are published and public)
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
        // Assuming the Redemption Tiers sheet has columns: "Tier", "Tokens", "Description"
        setTiers(tiersRes.data);

        // Assuming the Settings sheet returns rows with keys "type" and "amount"
        // This maps the first row into an object like: { "StakeUSDPerEntry": 150, "DonationUSDPerEntry": 250, ... }
        const mappedSettings = {};
        settingsRes.data.forEach((entry) => {
          // Ensure your sheet has headers exactly matching these keys:
          // e.g., type: "StakeUSDPerEntry", amount: "150"
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
        <h2 className="text-xl font-bold text-green-700 mb-2">🎁 Giveaway Entry Settings</h2>
        {Object.keys(settings).length > 0 ? (
          Object.entries(settings).map(([key, value]) => (
            <p key={key}>
              <strong>{key}:</strong> ${value} = 1 Entry
            </p>
          ))
        ) : (
          <p>Loading settings...</p>
        )}
      </div>

      <div className="border p-4 rounded-xl shadow bg-white">
        <h2 className="text-xl font-bold text-green-700 mb-2">🏷️ Redemption Tiers</h2>
        {tiers.length > 0 ? (
          tiers.map((tier, idx) => (
            <div key={idx} className="mb-2">
              <p>
                <strong>{tier.Tier}</strong>: {tier.Tokens} IHRAM tokens required — {tier.Description}
              </p>
            </div>
          ))
        ) : (
          <p>Loading tiers...</p>
        )}
      </div>
    </div>
  );
}
