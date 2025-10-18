// frontend/src/components/AdminFunctionForm.js
import React, { useState } from "react";
import AdminAddEvent from "./AdminAddEventForm";
import AdminAddProgram from "./AdminAddProgramForm";
import AdminClearRsvp from "./AdminClearRsvp";
import AdminUpdateDatabase from "./AdminUpdateDatabase";

const AdminFunctions = () => {
  const [activeTab, setActiveTab] = useState("programs");

  return (
    <div style={{ padding: "1rem" }}>
      {/* Tabs */}
      <div style={{ display: "flex", marginBottom: "1rem" }}>
        <button
          style={{
            padding: "0.5rem 1rem",
            marginRight: "0.5rem",
            backgroundColor: activeTab === "programs" ? "#4c6daf" : "#ccc",
            color: activeTab === "programs" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("programs")}
        >
          Programs
        </button>

        <button
          style={{
            padding: "0.5rem 1rem",
            marginRight: "0.5rem",
            backgroundColor: activeTab === "events" ? "#4c6daf" : "#ccc",
            color: activeTab === "events" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("events")}
        >
          Events
        </button>

        <button
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: activeTab === "clearrsvp" ? "#4c6daf" : "#ccc",
            color: activeTab === "clearrsvp" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("clearrsvp")}
        >
          Clear RSVP
        </button>

        <button
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: activeTab === "updatedb" ? "#4c6daf" : "#ccc",
            color: activeTab === "updatedb" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginLeft: "0.5rem"
          }}
          onClick={() => setActiveTab("updatedb")}
        >
          Update Database
        </button>

      </div>

      {/* Active Tab Content */}
      <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "4px" }}>
        {activeTab === "programs" && <AdminAddProgram />}
        {activeTab === "events" && <AdminAddEvent />}
        {activeTab === "clearrsvp" && <AdminClearRsvp />}
        {activeTab === "updatedb" && <AdminUpdateDatabase />}
      </div>
    </div>
  );
};

export default AdminFunctions;