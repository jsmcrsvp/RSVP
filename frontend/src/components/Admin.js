// frontend/src/components/AdminFunctionForm.js
import React, { useState } from "react";
import AdminAddEvent from "./AdminAddEventForm";
import AdminAddProgram from "./AdminAddProgramForm";
import AdminClearRsvp from "./AdminClearRsvp";
import AdminUpdateDatabase from "./AdminUpdateDatabase"; // 👈 NEW IMPORT

const AdminFunctions = () => {
  const [activeTab, setActiveTab] = useState("programs");

  const buttonStyle = (tab) => ({
    padding: "0.5rem 1rem",
    marginRight: "0.5rem",
    backgroundColor: activeTab === tab ? "#4c6daf" : "#ccc",
    color: activeTab === tab ? "white" : "black",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  });

  return (
    <div style={{ padding: "1rem" }}>
      {/* Tabs */}
      <div style={{ display: "flex", marginBottom: "1rem", flexWrap: "wrap" }}>
        <button style={buttonStyle("programs")} onClick={() => setActiveTab("programs")}>
          Programs
        </button>
        <button style={buttonStyle("events")} onClick={() => setActiveTab("events")}>
          Events
        </button>
        <button style={buttonStyle("clearrsvp")} onClick={() => setActiveTab("clearrsvp")}>
          Clear RSVP
        </button>
        <button style={buttonStyle("updatedb")} onClick={() => setActiveTab("updatedb")}>
          Update Database
        </button>
      </div>

      {/* Active Tab Content */}
      <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "4px" }}>
        {activeTab === "programs" && <AdminAddProgram />}
        {activeTab === "events" && <AdminAddEvent />}
        {activeTab === "clearrsvp" && <AdminClearRsvp />}
        {activeTab === "updatedb" && <AdminUpdateDatabase />} {/* 👈 NEW TAB CONTENT */}
      </div>
    </div>
  );
};

export default AdminFunctions;


/* frontend/src/components/Admin.js
import React, { useState, useEffect } from "react";
import ActivateEventForm from "./ActivateEventForm";
import Dashboard from "./Dashboard";
import AdminFunctions from "./AdminFunctionForm";
import AdminEventReport from "./AdminEventReport";
import logo from "../assets/JSMCLogo.jpg";
import "../styles/Admin.css";

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
        <h4>Select a tab to manage RSVP programs and events</h4>

        {/* Tabs
        <div className="tab-header">
          <button className={activeTab === "home" ? "tab active" : "tab"} onClick={() => setActiveTab("home")}>
            Home
          </button>
          <button className={activeTab === "dashboard" ? "tab active" : "tab"} onClick={() => setActiveTab("dashboard")}>
            RSVP Dashboard
          </button>
          <button className={activeTab === "activateEvent" ? "tab active" : "tab"} onClick={() => setActiveTab("activateEvent")}>
            Manage Event
          </button>
          <button className={activeTab === "report" ? "tab active" : "tab"} onClick={() => setActiveTab("report")}>
            Report
          </button>
          <button className={activeTab === "adminFunction" ? "tab active" : "tab"} onClick={() => setActiveTab("adminFunction")}>
            Admin Functions
          </button>
        </div>

        {/* HOME
        {activeTab === "home" && (
          <div className="home">
            {/*<p>Select a tab to manage RSVP programs and events.</p>
          </div>
        )}

        {/* DASHBOARD
        {activeTab === "dashboard" && <Dashboard />}

        {/* ACTIVATE EVENT
        {activeTab === "activateEvent" && <ActivateEventForm />}

        {/* REPORT
        {activeTab === "report" && <AdminEventReport />}

        {/* ADMIN FUNCTIONS
        {activeTab === "adminFunction" && <AdminFunctions />}
      </div>
    </div>
  );
}
*/