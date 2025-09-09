import React, { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import AddProgramForm from "./AddProgramForm";
import "../styles/Admin.css";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    document.title = "JSMC RSVP Admin Portal";
  }, []);

  return (
    <div className="page-wrapper">
      <div className="admin-container">
        <h2>JSMC RSVP Admin Portal</h2>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button onClick={() => setActiveTab("home")}>Home</button>
          <button onClick={() => setActiveTab("dashboard")}>RSVP Dashboard</button>
          <button onClick={() => setActiveTab("addProgram")}>Add Program</button>
          <button onClick={() => setActiveTab("report")}>Report</button>
        </div>

        {/* Tab Content */}
        <div className="admin-content">
          {activeTab === "home" && <h4>Welcome to JSMC RSVP Admin Portal</h4>}
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "addProgram" && <AddProgramForm />}
          {activeTab === "report" && <h4>Report section coming soon...</h4>}
        </div>
      </div>
    </div>
  );
}
