import React, { useEffect, useState } from "react";
import { getAllPrograms, getOpenEvents, getClosedEvents, getDashboardStats, getRsvpDetails } from "../api";
import axios from "axios";

export default function AdminEventReport() {
  const [programs, setPrograms] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [stats, setStats] = useState([]);
  const [memberDetails, setMemberDetails] = useState([]);


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

  // Fetch events when a program is selected
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
        const filteredEvents = [...openData, ...closedData].filter(
          (ev) => ev.programname === selectedProgram
        );
        setEvents(filteredEvents);
        setSelectedEvent(""); // Require manual selection
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events for the selected program.");
      }
    };

    fetchEvents();
  }, [selectedProgram]);

  const generateReport = async () => {
    if (!selectedProgram || !selectedEvent) return;

    try {
      setReportLoading(true);
      const statsData = await getDashboardStats();
      const allStats = Array.isArray(statsData) ? statsData : []

      console.log("Dashboard stats response:", allStats);

      const filtered = allStats.filter(
        (item) =>
          item.programname.trim().toLowerCase() === selectedProgram.trim().toLowerCase() &&
          item.eventname.trim().toLowerCase() === selectedEvent.trim().toLowerCase()
      );

      setReportData(filtered);

      console.log("Selected Program:", selectedProgram);
      console.log("Selected Event:", selectedEvent);

      // Fetch member-level RSVP details
      const detailRes = await getRsvpDetails(selectedProgram, selectedEvent);
      //setMemberDetails(Array.isArray(detailRes.data) ? detailRes.data : []);
      const setMemberDetails = (Array.isArray(detailRes.data) ? detailRes : []);
      console.log("Member stats response:", setMemberDetails);

      setError("");
    } catch (err) {
      console.error("Error fetching report:", err);
      setError("Failed to fetch RSVP report data.");
      setReportData([]);
      setMemberDetails([]);
    } finally {
      setReportLoading(false);
    }
  };

  /* Fetch RSVP summary data
const generateReport = async () => {
  if (!selectedProgram || !selectedEvent) return;

  try {
    setReportLoading(true);
    //const res = await getDashboardStats();
    const statsData = await getDashboardStats();
    const allStats = Array.isArray(statsData) ? statsData : []
    //setStats(Array.isArray(statsData) ? statsData : []);

    console.log("Dashboard stats response:", allStats);
    console.log("Selected Program:", selectedProgram);
    console.log("Selected Event:", selectedEvent);

    const filtered = allStats.filter(
      (item) =>
        item.programname.trim().toLowerCase() === selectedProgram.trim().toLowerCase() &&
        item.eventname.trim().toLowerCase() === selectedEvent.trim().toLowerCase()
    );

    console.log("Filtered:", filtered);

    setReportData(filtered);
    setError("");
  } catch (err) {
    console.error("Error fetching report:", err);
    setError("Failed to fetch RSVP report data.");
    setReportData([]);
  } finally {
    setReportLoading(false);
  }
};
*/

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Admin RSVP Event Report</h3>

      {loading ? (
        <p>Loading programs...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          {/* Program Selection */}
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
                <option key={idx} value={p.progname}>{p.progname}</option>
              ))}
            </select>
          </div>

          {/* Event Selection */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="eventSelect">Event:</label>
            <select
              id="eventSelect"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              style={{ marginLeft: "0.5rem" }}
              disabled={events.length === 0}
            >
              <option value="">-- Select Event --</option>
              {events.map((ev, idx) => (
                <option key={idx} value={ev.eventname}>{ev.eventname}</option>
              ))}
            </select>
          </div>

          {/* Generate Report Button */}
          <button
            onClick={generateReport}
            disabled={!selectedProgram || !selectedEvent || reportLoading}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: !selectedProgram || !selectedEvent ? "grey" : "#007bff",
              color: "white",
              cursor: !selectedProgram || !selectedEvent ? "not-allowed" : "pointer",
              marginBottom: "1rem",
            }}
          >
            {reportLoading ? "Generating..." : "Generate Report"}
          </button>

          {/* Report Table */}

          {memberDetails.length > 0 && (
            <div style={{ overflowX: "auto", marginTop: "2rem" }}>
              <h4>Member RSVP Details</h4>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Member Name</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Phone Number</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Adult RSVP</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Kids RSVP</th>
                  </tr>
                </thead>
                <tbody>
                  {memberDetails.map((rsvp, idx) => (
                    <tr key={idx}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{rsvp.memname}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{rsvp.memphonenumber}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{rsvp.rsvpcount}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{rsvp.kidsrsvpcount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* No Data Message */}
          {reportData.length === 0 && !reportLoading && selectedEvent && (
            <p>No RSVP summary found for the selected event.</p>
          )}
        </>
      )}
    </div>
  );
}



{/* frontend/src/components/AdminEventReport.js
import React, { useEffect, useState } from "react";
import { getAllPrograms, getOpenEvents, getClosedEvents, getDashboardStats } from "../api";
import axios from "axios";

export default function AdminEventReport() {
  const [programs, setPrograms] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

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

  // Fetch events when a program is selected
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
        const filteredEvents = [...openData, ...closedData].filter(
          (ev) => ev.programname === selectedProgram
        );
        setEvents(filteredEvents);
        setSelectedEvent("");
        //setSelectedEvent(filteredEvents.length > 0 ? filteredEvents[0].eventname : "");
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events for the selected program.");
      }
    };

    fetchEvents();
  }, [selectedProgram]);

  useEffect(() => {
    console.log("Selected Program:", selectedProgram);
    console.log("Selected Event:", selectedEvent);
  }, [selectedProgram, selectedEvent]);

  // Fetch RSVP data for table
  const generateReport = async () => {
    if (!selectedProgram || !selectedEvent) return;

    try {
      setReportLoading(true);
      const res = await getDashboardStats();
      const allStats = Array.isArray(res.data) ? res.data : [];
      console.log (allStats);
      // Filter for selected program and event
      const filtered = allStats.filter(
        (item) =>
          item.programname === selectedProgram &&
          item.eventname === selectedEvent
      );

      setReportData(filtered);
      setError("");
    } catch (err) {
      console.error("Error fetching report:", err);
      setError("Failed to fetch RSVP report data.");
      setReportData([]);
    } finally {
      setReportLoading(false);
    }
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
                <option key={idx} value={p.progname}>{p.progname}</option>
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
                <option value="">-- Select Event --</option>
              ) : (
                events.map((ev, idx) => (
                  <option key={idx} value={ev.eventname}>{ev.eventname}</option>
                ))
              )}
            </select>
          </div>

          <p>Selected Program: {selectedProgram}</p>
          <p>Selected Event: {selectedEvent}</p>

          <button
            onClick={generateReport}
            disabled={!selectedProgram || !selectedEvent || reportLoading}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: !selectedProgram || !selectedEvent ? "grey" : "#007bff",
              color: "white",
              cursor: !selectedProgram || !selectedEvent ? "not-allowed" : "pointer",
              marginBottom: "1rem",
            }}
          >
            {reportLoading ? "Generating..." : "Generate Report"}
          </button>

{reportData.length > 0 && (
  <table>
    <thead>
      <tr>
        <th>Program</th>
        <th>Event</th>
        <th>Date</th>
        <th>Day</th>
        <th>Adult RSVP</th>
        <th>Kids RSVP</th>
      </tr>
    </thead>
    <tbody>
      {reportData.map((r, idx) => (
        <tr key={idx}>
          <td>{r.programname}</td>
          <td>{r.eventname}</td>
          <td>{r.eventdate}</td>
          <td>{r.eventday}</td>
          <td>{r.totalRSVPs}</td>
          <td>{r.totalKidsRSVPs}</td>
        </tr>
      ))}
    </tbody>
  </table>
)}

{/*
          {reportData.length > 0 && (
            <div style={{ overflowX: "auto", marginTop: "1rem" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Member Name</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Phone Number</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Adult RSVP</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Kids RSVP</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((rsvp, idx) => (
                    <tr key={idx}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{rsvp.memname}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{rsvp.memphonenumber}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{rsvp.rsvpcount}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{rsvp.kidsrsvpcount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportData.length === 0 && !reportLoading && selectedEvent && (
            <p>No RSVPs found for the selected event.</p>
          )}
        </>
      )}
    </div>
  );
}
*/}