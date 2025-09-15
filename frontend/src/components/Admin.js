import React, { useState, useEffect } from "react";
//import AddProgramForm from "./AddProgramForm";
import ActivateEventForm from "./ActivateEventForm";
import Dashboard from "./Dashboard";
import "../styles/Admin.css";
import logo from "../assets/JSMCLogo.jpg";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("home");

  // set browser tab title
  useEffect(() => {
    document.title = "JSMC RSVP Admin Portal";
  }, []);

  return (
    <div className="page-wrapper">
      <div className="admin-container">
              <div className="logo-wrapper">
                <img src={logo} alt="JSMC Logo" className="rsvp-logo" />
              </div>
        <h2>JSMC RSVP Admin Portal</h2>
        <h4>Welcome to JSMC RSVP Admin Portal</h4>

        {/* Tabs */}
         <div className="tab-header">
          <button className={activeTab === "home" ? "tab active" : "tab"} onClick={() => setActiveTab("home")}>
            Home
          </button>
          <button className={activeTab === "dashboard" ? "tab active" : "tab"} onClick={() => setActiveTab("dashboard")}>
            RSVP Dashboard
          </button>
          <button className={activeTab === "activateEvent" ? "tab active" : "tab"} onClick={() => setActiveTab("activateEvent")}>
            Programs
          </button>
          <button className={activeTab === "report" ? "tab active" : "tab"} onClick={() => setActiveTab("report")}>
            Report
          </button>
        </div>

        {/* HOME */}
        {activeTab === "home" && (
          <div className="home">
            <p>Select a tab to manage RSVP programs and events.</p>
          </div>
        )}

        {/* DASHBOARD */}
        {activeTab === "dashboard" && <Dashboard />}

        {/* ACTIVATE EVENT */}
        {activeTab === "activateEvent" && <ActivateEventForm />}

        {/* REPORT */}
        {activeTab === "report" && (
          <div className="report">
            <h4>Reports Coming Soon...</h4>
          </div>
        )}
      </div>
    </div>
  );
}
