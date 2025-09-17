// frontend/src/components/AdminEventReport.js
import React, { useEffect, useState } from "react";
import { getAllPrograms } from "../api";
import axios from "axios";

export default function AdminEventReport() {
  const [programs, setPrograms] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState("");

  // Fetch programs from backend
  useEffect(() => {
    const fetchPrograms = async () => {
      setLoadingPrograms(true);
      setError("");
      try {
        const data = await getAllPrograms();
        setPrograms(data || []);
      } catch (err) {
        console.error("Error fetching programs:", err);
        setError("Failed to load programs.");
      } finally {
        setLoadingPrograms(false);
      }
    };
    fetchPrograms();
  }, []);

  // Update events when program changes
  useEffect(() => {
    if (!selectedProgram) {
      setEvents([]);
      setSelectedEvent("");
      return;
    }

    setLoadingEvents(true);
    setError("");

    const fetchEvents = async () => {
      try {
        // Use Dashboard-style routes to get open and closed events
        const openRes = await axios.get("/api/programs/open");
        const closedRes = await axios.get("/api/programs/closed");

        const allEvents = [
          ...(Array.isArray(openRes.data) ? openRes.data : []),
          ...(Array.isArray(closedRes.data) ? closedRes.data : []),
        ];

        // Filter by selected program
        const filteredEvents = allEvents.filter(
          (ev) => ev.programname === selectedProgram
        );

        setEvents(filteredEvents);
        if (filteredEvents.length === 0) setSelectedEvent("");
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events for selected program.");
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [selectedProgram]);

  // Handle Excel download
  const handleDownload = () => {
    if (!selectedProgram || !selectedEvent) {
      alert("Please select a program and event to download report.");
      return;
    }

    const url = `/api/report/download/${encodeURIComponent(
      selectedProgram
    )}/${encodeURIComponent(selectedEvent)}`;
    // Open download in new tab/window
    window.open(url, "_blank");
  };

  return (
    <div className="admin-report">
      <h3>Admin Event RSVP Report</h3>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <div style={{ marginBottom: "1rem" }}>
        <label>Program: </label>
        {loadingPrograms ? (
          <span>Loading programs...</span>
        ) : (
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            <option value="">-- Select Program --</option>
            {programs.map((p, idx) => (
              <option key={idx} value={p.progname}>
                {p.progname}
              </option>
            ))}
          </select>
        )}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Event: </label>
        {loadingEvents ? (
          <span>Loading events...</span>
        ) : events.length === 0 ? (
          <span>No Open or Closed events for this program</span>
        ) : (
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="">-- Select Event --</option>
            {events.map((ev, idx) => (
              <option key={idx} value={ev.eventname}>
                {ev.eventname} ({ev.eventday}, {ev.eventdate})
              </option>
            ))}
          </select>
        )}
      </div>

      <button
        onClick={handleDownload}
        disabled={!selectedProgram || !selectedEvent}
        style={{
          backgroundColor:
            !selectedProgram || !selectedEvent ? "grey" : "#007bff",
          color: "white",
          padding: "0.5rem 1rem",
          border: "none",
          cursor: !selectedProgram || !selectedEvent ? "not-allowed" : "pointer",
        }}
      >
        Download RSVP Report (Excel)
      </button>
    </div>
  );
}
