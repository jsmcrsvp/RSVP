//frontend/src/components/Dashboard.js
import React, { useEffect, useState, useCallback } from "react";
import { getOpenEvents, getClosedEvents, getDashboardStats } from "../api";
import "../styles/Dashboard.css";

// ✅ Utility to format YYYY-MM-DD → MM/DD/YYYY
const displayDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
};

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openEvents, setOpenEvents] = useState([]);
  const [closedEvents, setClosedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // 🔄 reusable function to load everything
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setLoadingEvents(true);
    setError("");

    try {
      // Fetch stats
      const statsData = await getDashboardStats();
      setStats(Array.isArray(statsData) ? statsData : []);

      // Fetch open + closed events
      const [openData, closedData] = await Promise.all([
        getOpenEvents(),
        getClosedEvents(),
      ]);

      setOpenEvents(Array.isArray(openData) ? openData : []);
      setClosedEvents(Array.isArray(closedData) ? closedData : []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load RSVP events.");
    } finally {
      setLoading(false);
      setLoadingEvents(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ⏱ Auto refresh every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("⏱ Auto refreshing dashboard...");
      loadDashboardData();
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // ✅ Filter stats into open & closed groups
  const openStats = stats.filter((row) =>
    openEvents.some(
      (ev) =>
        ev.programname === row.programname &&
        ev.eventname === row.eventname &&
        ev.eventdate === row.eventdate &&
        ev.eventday === row.eventday
    )
  );

  const closedStats = stats.filter((row) =>
    closedEvents.some(
      (ev) =>
        ev.programname === row.programname &&
        ev.eventname === row.eventname &&
        ev.eventdate === row.eventdate &&
        ev.eventday === row.eventday
    )
  );

  return (
    /*<div style={{ overflowX: "auto", marginTop: "0rem", marginBottom: "0rem" }}>*/
    <div className="page-wrapper">
      <div className="dashboard-container">
        {(loading || loadingEvents) && <p>Loading dashboard...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Open Events Table */}
        {!loading && !loadingEvents && !error && (
          <>

            {openStats.length === 0 ? (
              <p style={{ fontStyle: "italic", color: "#666" }}>
                No RSVP responses for open events.
              </p>
            ) : (
              <>
                <h4 style={{ textAlign: "center", margin: "1rem 0 0.5rem 0", color: "#5d8cdf" }}>
                  Current Open Events
                </h4>
                <div className="result-table-wrapper">
                  <table className="result-table">
                    <thead>
                      <tr>
                        <th>Program</th>
                        <th>Event Name</th>
                        <th>Event Date</th>
                        <th>Adult RSVP</th>
                        <th>Kids RSVP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openStats.map((row, idx) => (
                        <tr key={`open-${idx}`}>
                          <td>{row.programname}</td>
                          <td>{row.eventname}</td>
                          <td>{row.eventday}, {displayDate(row.eventdate)}</td>
                          <td>{row.totalRSVPs}</td>
                          <td>{row.totalKidsRSVPs}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Closed Events Table */}
            {closedStats.length === 0 ? (
              <p style={{ fontStyle: "italic", color: "#666" }}>
                No RSVP responses for closed events.
              </p>
            ) : (
              <>
                <h4 style={{ textAlign: "center", margin: "1rem 0 0.5rem 0", color: "#5d8cdf" }}>
                  Current Closed Events
                </h4>
                <div className="result-table-wrapper">
                  <table className="result-table">
                    <thead>
                      <tr>
                        <th>Program</th>
                        <th>Event Name</th>
                        <th>Event Date</th>
                        <th>Adult RSVP</th>
                        <th>Kids RSVP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {closedStats.map((row, idx) => (
                        <tr key={`closed-${idx}`}>
                          <td>{row.programname}</td>
                          <td>{row.eventname}</td>
                          <td>{row.eventday}, {displayDate(row.eventdate)}</td>
                          <td>{row.totalRSVPs}</td>
                          <td>{row.totalKidsRSVPs}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* 🔄 Manual Refresh Button */}
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <button
                className="btn-refresh"
                onClick={loadDashboardData}
                disabled={loading || loadingEvents}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#4c6daf",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {loading || loadingEvents ? "Refreshing..." : "🔄 Refresh Dashboard"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



{/* frontend/src/components/Dashboard.js ==== Working 091625 ==== 5:00pm ===
import React, { useEffect, useState, useCallback } from "react";
import { getOpenEvents, getClosedEvents, getDashboardStats } from "../api";
import "../styles/Dashboard.css";

// ✅ Utility to format YYYY-MM-DD → MM/DD/YYYY
const displayDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
};

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openEvents, setOpenEvents] = useState([]);
  const [closedEvents, setClosedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // 🔄 reusable function to load everything
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setLoadingEvents(true);
    setError("");

    try {
      // Fetch stats
      const statsData = await getDashboardStats();
      setStats(Array.isArray(statsData) ? statsData : []);

      // Fetch open + closed events
      const [openData, closedData] = await Promise.all([
        getOpenEvents(),
        getClosedEvents(),
      ]);

      setOpenEvents(Array.isArray(openData) ? openData : []);
      setClosedEvents(Array.isArray(closedData) ? closedData : []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load RSVP events.");
    } finally {
      setLoading(false);
      setLoadingEvents(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ⏱ Auto refresh every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("⏱ Auto refreshing dashboard...");
      loadDashboardData();
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // ✅ Filter stats into open & closed groups
  const openStats = stats.filter((row) =>
    openEvents.some(
      (ev) =>
        ev.programname === row.programname &&
        ev.eventname === row.eventname &&
        ev.eventdate === row.eventdate &&
        ev.eventday === row.eventday
    )
  );

  const closedStats = stats.filter((row) =>
    closedEvents.some(
      (ev) =>
        ev.programname === row.programname &&
        ev.eventname === row.eventname &&
        ev.eventdate === row.eventdate &&
        ev.eventday === row.eventday
    )
  );

  return (
    <div className="dashboard-container">
      {(loading || loadingEvents) && <p>Loading dashboard...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Open Events Table
      {!loading && !loadingEvents && !error && (
        <>

          {openStats.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "#666" }}>
              No RSVP responses for open events.
            </p>
          ) : (
            <>
              <h4 style={{ textAlign: "center", margin: "1rem 0 0.5rem 0", color: "#5d8cdf" }}>
                Current Open Events
              </h4>
              <div className="result-table-wrapper">
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Event Name</th>
                      <th>Event Date</th>
                      <th>Event RSVP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openStats.map((row, idx) => (
                      <tr key={`open-${idx}`}>
                        <td>{row.programname}</td>
                        <td>{row.eventname}</td>
                        <td>{row.eventday}, {displayDate(row.eventdate)}</td>
                        <td>{row.totalRSVPs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Closed Events Table
          {closedStats.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "#666" }}>
              No RSVP responses for closed events.
            </p>
          ) : (
            <div className="result-table-wrapper">
              <h4>Current Closed Events</h4>
              <table className="result-table">
                <thead>
                  <tr>
                    <th>Program</th>
                    <th>Event Name</th>
                    <th>Event Date</th>
                    <th>Event RSVP</th>
                  </tr>
                </thead>
                <tbody>
                  {closedStats.map((row, idx) => (
                    <tr key={`closed-${idx}`}>
                      <td>{row.programname}</td>
                      <td>{row.eventname}</td>
                      <td>{row.eventday}, {displayDate(row.eventdate)}</td>
                      <td>{row.totalRSVPs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 🔄 Manual Refresh Button
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              className="btn-refresh"
              onClick={loadDashboardData}
              disabled={loading || loadingEvents}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                background: "#4c6daf",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {loading || loadingEvents ? "Refreshing..." : "🔄 Refresh Dashboard"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
*/}