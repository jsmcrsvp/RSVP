// frontend/src/components/AdminEventReport.js
import React, { useState, useEffect } from "react";
import axios from "axios";
//import "../styles/AdminEventReport.css";

export default function AdminEventReport() {
  const [programs, setPrograms] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState("");

  const backendURL = "/api/report"; // matches the report.js routes

  // Fetch programs on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoadingPrograms(true);
        const res = await axios.get(`${backendURL}/programs`);
        setPrograms(res.data);
        setLoadingPrograms(false);
      } catch (err) {
        console.error("Error fetching programs:", err);
        setError("Failed to load programs.");
        setLoadingPrograms(false);
      }
    };
    fetchPrograms();
  }, []);

  // Fetch events when a program is selected
  useEffect(() => {
    if (!selectedProgram) {
      setEvents([]);
      setSelectedEvent("");
      return;
    }

    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const res = await axios.get(`${backendURL}/events/${selectedProgram}`);
        setEvents(res.data);
        setSelectedEvent(""); // reset selected event
        setLoadingEvents(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events.");
        setEvents([]);
        setSelectedEvent("");
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [selectedProgram]);

  // Handle Excel download
  const handleDownload = async () => {
    if (!selectedProgram || !selectedEvent) return;

    try {
      const res = await axios.get(
        `${backendURL}/download/${selectedProgram}/${selectedEvent}`,
        { responseType: "blob" } // important for file download
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `RSVP_Report_${selectedProgram}_${selectedEvent}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading report:", err);
      setError("Failed to download report.");
    }
  };

  return (
    <div className="admin-report-container">
      <h3>Admin Event RSVP Report</h3>

      {error && <div className="error-message">{error}</div>}

      <div className="report-controls">
        <div className="form-group">
          <label>Program:</label>
          {loadingPrograms ? (
            <span>Loading programs...</span>
          ) : (
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              <option value="">-- Select Program --</option>
              {programs.map((prog, idx) => (
                <option key={idx} value={prog.progname}>
                  {prog.progname} ({prog.eventstatus})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label>Event:</label>
          {loadingEvents ? (
            <span>Loading events...</span>
          ) : events.length === 0 ? (
            <span>No Open or Closed events</span>
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
          className="button"
          onClick={handleDownload}
          disabled={!selectedProgram || !selectedEvent}
        >
          Download Excel Report
        </button>
      </div>
    </div>
  );
}
