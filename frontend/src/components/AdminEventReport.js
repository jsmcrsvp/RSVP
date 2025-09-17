// frontend/src/components/EventReport.js
import React, { useState, useEffect } from "react";
import { getPrograms } from "../api";

const SERVER_URL =
  process.env.REACT_APP_BACKEND_SERVER_URL || "http://localhost:3001";

const AdminEventReport = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");

  // Fetch programs + events
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await getPrograms();
        setPrograms(data);
      } catch (err) {
        console.error("Error fetching programs:", err);
      }
    };
    fetchPrograms();
  }, []);

  // Handle report download
  const handleDownload = () => {
    if (!selectedProgram || !selectedEvent) {
      alert("Please select a program and event.");
      return;
    }

    const url = `${SERVER_URL}/api/report/${encodeURIComponent(
      selectedProgram
    )}/${encodeURIComponent(selectedEvent)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Download RSVP Report</h2>

      <div>
        <label style={{ marginRight: "10px" }}>Select Program:</label>
        <select
          value={selectedProgram}
          onChange={(e) => {
            setSelectedProgram(e.target.value);
            setSelectedEvent("");
          }}
        >
          <option value="">-- Select Program --</option>
          {programs.map((prog) => (
            <option key={prog._id} value={prog.progname}>
              {prog.progname}
            </option>
          ))}
        </select>
      </div>

      {selectedProgram && (
        <div style={{ marginTop: "15px" }}>
          <label style={{ marginRight: "10px" }}>Select Event:</label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="">-- Select Event --</option>
            {programs
              .filter((p) => p.progname === selectedProgram)
              .flatMap((p) =>
                (p.events || [])
                  .filter(
                    (ev) =>
                      ev.eventstatus === "Open" || ev.eventstatus === "Closed"
                  )
                  .map((ev, idx) => (
                    <option key={idx} value={ev.eventname}>
                      {ev.eventname} ({ev.eventstatus})
                    </option>
                  ))
              )}
          </select>
        </div>
      )}

      <button
        onClick={handleDownload}
        style={{
          marginTop: "20px",
          padding: "8px 16px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Download Report
      </button>
    </div>
  );
};

export default AdminEventReport;
