// frontend/src/components/AdminEventReport.js
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminEventReport() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  // Load programs on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await axios.get("/api/report/programs");
        setPrograms(res.data);
      } catch (err) {
        console.error("Error fetching programs:", err);
      } finally {
        setLoadingPrograms(false);
      }
    };
    fetchPrograms();
  }, []);

  // Load events when program changes
  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedProgram) return;
      setLoadingEvents(true);
      try {
        const res = await axios.get(`/api/report/events/${encodeURIComponent(selectedProgram)}`);
        setEvents(res.data);
        setSelectedEvent(""); // reset event selection
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [selectedProgram]);

  // Handle Excel download
  const handleDownload = async () => {
    if (!selectedProgram || !selectedEvent) return;

    setDownloadError("");
    try {
      const res = await axios.get(
        `/api/report/download/${encodeURIComponent(selectedProgram)}/${encodeURIComponent(selectedEvent)}`,
        { responseType: "blob" } // important for file download
      );

      // Create a link to download the file
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
      setDownloadError("Failed to download report. Make sure RSVPs exist for this event.");
    }
  };

  return (
    <div className="admin-event-report">
      <h3>Admin Event RSVP Report</h3>

      <div className="form-group">
        <label>Program:</label>
        {loadingPrograms ? (
          <p>Loading programs...</p>
        ) : (
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            <option value="">-- Select Program --</option>
            {programs.map((prog, idx) => (
              <option key={idx} value={prog.progname}>
                {prog.progname}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="form-group">
        <label>Event:</label>
        {loadingEvents ? (
          <p>Loading events...</p>
        ) : events.length > 0 ? (
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="">-- Select Event --</option>
            {events.map((ev, idx) => (
              <option key={idx} value={ev.eventname}>
                {ev.eventname} ({ev.eventstatus})
              </option>
            ))}
          </select>
        ) : (
          <p>No Open/Closed events available.</p>
        )}
      </div>

      <button
        className="button"
        onClick={handleDownload}
        disabled={!selectedProgram || !selectedEvent}
        style={{
          backgroundColor: !selectedProgram || !selectedEvent ? "grey" : "#007bff",
          color: "white",
          cursor: !selectedProgram || !selectedEvent ? "not-allowed" : "pointer",
          marginTop: "1rem"
        }}
      >
        Download Excel Report
      </button>

      {downloadError && (
        <div style={{ color: "red", marginTop: "0.5rem" }}>{downloadError}</div>
      )}
    </div>
  );
}
