import React, { useState } from "react";
import "../styles/Admin.css";
import AddProgramForm from "./AddProgramForm";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="page-wrapper">
      <div className="admin-container">
        <h2>JSMC RSVP Admin Portal</h2>

        {/* Tabs Navigation */}
        <div className="tab-nav">
          <button
            className={activeTab === "home" ? "active" : ""}
            onClick={() => setActiveTab("home")}
          >
            Home
          </button>
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            RSVP Dashboard
          </button>
          <button
            className={activeTab === "addProgram" ? "active" : ""}
            onClick={() => setActiveTab("addProgram")}
          >
            Add Program
          </button>
          <button
            className={activeTab === "report" ? "active" : ""}
            onClick={() => setActiveTab("report")}
          >
            Report
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "home" && (
            <div className="home-tab">
              <h4>Welcome to JSMC RSVP Admin Portal</h4>
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="dashboard-tab">
              <h4>RSVP Dashboard</h4>
              <p>📊 Dashboard will go here.</p>
            </div>
          )}

          {activeTab === "addProgram" && (
            <div className="add-program-tab">
              <AddProgramForm />
            </div>
          )}

          {activeTab === "report" && (
            <div className="report-tab">
              <h4>Report</h4>
              <p>📑 Reports will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
