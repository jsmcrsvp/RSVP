// frontend/src/components/RSVPPage.js
import React, { useState, useEffect } from "react";
import Home from "./Home";
import SubmitRSVPLanding from "./SubmitRSVP/SubmitRSVPLanding";
import VerifyRSVP from "./VerifyRSVP";
import { getOpenEvents } from "../api";
import logo from "../assets/JSMCLogo.jpg";
import "../styles/SubmitRSVP.css";

export default function RSVPPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  // Reset function shared across all tabs
  const resetAll = () => {
    setActiveTab("home");
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getOpenEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load open events:", err);
        setError("Failed to load open events.");
      }
    })();
  }, []);

  return (
    <div className="page-wrapper">
      <div className="rsvp-container">
        {/* Logo */}
        <div className="logo-wrapper">
          <img src={logo} alt="JSMC Logo" className="rsvp-logo" />
        </div>

        {/* Tabs */}
        <div className="tab-header">
          <button
            className={activeTab === "home" ? "tab active" : "tab"}
            onClick={() => resetAll()}
          >
            Home
          </button>
          <button
            className={activeTab === "submit" ? "tab active" : "tab"}
            onClick={() => setActiveTab("submit")}
          >
            Submit RSVP
          </button>
          <button
            className={activeTab === "verify" ? "tab active" : "tab"}
            onClick={() => setActiveTab("verify")}
          >
            Verify / Modify RSVP
          </button>
        </div>

        {/* Page rendering */}
        {activeTab === "home" && <Home events={events} error={error} />}
        {activeTab === "submit" && (
          <SubmitRSVPLanding events={events} onHome={resetAll} />
        )}
        {activeTab === "verify" && <VerifyRSVP onHome={resetAll} />}
      </div>
    </div>
  );
}
