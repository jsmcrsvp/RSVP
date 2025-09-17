import React, { useState, useEffect } from "react";
import { getAllPrograms, getReportEvents } from "../api"; // make sure api.js has matching calls
import axios from "axios";

export default function AdminEventReport() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all programs on mount
  useEffect(() => {
    async function fetchPrograms() {
      try {
        const res = await getAllPrograms();
        setPrograms(res.map(p => p.progname));
      } catch (err) {
        console.error("Error fetching programs:", err);
      }
    }
    fetchPrograms();
  }, []);

  // Fetch events when program changes
  useEffect(() => {
    if (!selectedProgram) {
      setEvents([]);
      setSelectedEvent("");
      return;
    }

    async function fetchEvents() {
      try {
        const res = await getReportEvents(selectedProgram);
        setEvents(res.map(ev => ev.eventname));
        setSelectedEvent(res.length ? res[0].eventname : "");
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
        setSelectedEvent("");
      }
    }
    fetchEvents();
  }, [selectedProgram]);

  const handleDownload = async () => {
    if (!selectedProgram || !selectedEvent) return;

    const url = `/api/report/download/${encodeURIComponent(selectedProgram)}/${encodeURIComponent(selectedEvent)}`;
    window.open(url, "_blank"); // opens download in new tab
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Admin Event Report</h3>

      <div style={{ marginBottom: "1rem" }}>
        <label>Program: </label>
        <select value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)}>
          <option value="">-- Select Program --</option>
          {programs.map((prog, idx) => (
            <option key={idx} value={prog}>{prog}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Event: </label>
        <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
          <option value="">{events.length ? "-- Select Event --" : "No Open or Closed Events"}</option>
          {events.map((ev, idx) => (
            <option key={idx} value={ev}>{ev}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleDownload}
        disabled={!selectedProgram || !selectedEvent}
      >
        Download Excel Report
      </button>
    </div>
  );
}
