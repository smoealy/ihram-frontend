import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import AiPlanner from "./pages/AiPlanner.jsx"; // Ensure this file exists
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ai-planner" element={<AiPlanner />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
