import { useEffect } from "react";

export default function AiPlanner() {
  useEffect(() => {
    window.location.href = "https://ihram-ai.vercel.app/";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-700">
      <p>Redirecting to Ihram AI...</p>
    </div>
  );
}
