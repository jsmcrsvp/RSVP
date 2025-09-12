// frontend/src/pages/SubmitRSVPLanding.js
import React, { useState } from "react";
import MemberRSVP from "../MemberRSVP";
import NonMemberRSVP from "../NonMemberRSVP";
import VerifyRSVP from "./VerifyRSVP";
import "../styles/SubmitRSVP.css";

export default function SubmitRSVPLanding() {
  const [activeTab, setActiveTab] = useState("landing");

  const resetAll = () => {
    setActiveTab("landing");
  };

  return (
    <div className="submit-rsvp-container">
      <img src="/logo.png" alt="Logo" className="rsvp-logo" />

      <div className="tab-buttons">
        <button
          className={activeTab === "landing" ? "active" : ""}
          onClick={() => resetAll()}
        >
          Home
        </button>
        <button
          className={activeTab === "member" ? "active" : ""}
          onClick={() => setActiveTab("member")}
        >
          I am a Member
        </button>
        <button
          className={activeTab === "nonmember" ? "active" : ""}
          onClick={() => setActiveTab("nonmember")}
        >
          I am not a Member
        </button>
        <button
          className={activeTab === "verify" ? "active" : ""}
          onClick={() => setActiveTab("verify")}
        >
          Verify / Modify
        </button>
      </div>

      {activeTab === "landing" && (
        <div className="landing-message">
          <h3>Please choose an option above</h3>
        </div>
      )}

      {activeTab === "member" && <MemberRSVP onHome={resetAll} />}
      {activeTab === "nonmember" && <NonMemberRSVP onHome={resetAll} />}
      {activeTab === "verify" && <VerifyRSVP onHome={resetAll} />}
    </div>
  );
}
