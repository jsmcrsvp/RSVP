// frontend/src/components/AdminEventReport.js
import React, { useEffect, useState } from "react";
import { getAllPrograms, getOpenEvents, getClosedEvents } from "../api";

export default function AdminEventReport() {
  const [programs, setPrograms] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch programs on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await getAllPrograms();
        setPrograms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching programs:", err);
        setError("Failed to load programs.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Fetch events whenever a program is selected
  useEffect(() => {
    if (!selectedProgram) {
      setEvents([]);
      setSelectedEvent("");
      return;
    }

    const fetchEvents = async () => {
      try {
        setError("");
        const [openData, closedData] = await Promise.all([
          getOpenEvents(),
          getClosedEvents(),
        ]);

        // Combine and filter by selected program
        const filteredEvents = [...openData, ...closedData].filter(
          (ev) => ev.programname === selectedProgram
        );

        setEvents(filteredEvents);
        setSelectedEvent(filteredEvents.length > 0 ? filteredEvents[0].eventname : "");
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events for the selected program.");
      }
    };

    fetchEvents();
  }, [selectedProgram]);

  const downloadExcel = () => {
    if (!selectedProgram || !selectedEvent) return;
    const url = `/api/report/download/${encodeURIComponent(selectedProgram)}/${encodeURIComponent(selectedEvent)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Admin RSVP Event Report</h3>

      {loading ? (
        <p>Loading programs...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="programSelect">Program:</label>
            <select
              id="programSelect"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              style={{ marginLeft: "0.5rem" }}
            >
              <option value="">-- Select Program --</option>
              {programs.map((p, idx) => (
                <option key={idx} value={p.progname}>
                  {p.progname} ({p.eventstatus || "N/A"})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="eventSelect">Event:</label>
            <select
              id="eventSelect"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              style={{ marginLeft: "0.5rem" }}
            >
              {events.length === 0 ? (
                <option value="">-- No Open/Closed Events --</option>
              ) : (
                events.map((ev, idx) => (
                  <option key={idx} value={ev.eventname}>
                    {ev.eventname} ({ev.eventday}, {ev.eventdate})
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={downloadExcel}
            disabled={!selectedProgram || !selectedEvent}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: !selectedProgram || !selectedEvent ? "grey" : "#007bff",
              color: "white",
              cursor: !selectedProgram || !selectedEvent ? "not-allowed" : "pointer",
            }}
          >
            Download Excel Report
          </button>
        </>
      )}
    </div>
  );
}
