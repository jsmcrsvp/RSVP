// frontend/src/components/Dashboard.js
import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../api";
import "../styles/SubmitRSVP.css"; // or a dashboard-specific css if you prefer

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getDashboardStats();
        setStats(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load RSVP stats:", err);
        setError("Failed to load RSVP events");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="dashboard-container">
      <h3>Current RSVP Stats</h3>

      {loading && <p>Loading dashboard...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && stats.length === 0 && (
        <p style={{ fontStyle: "italic", color: "#666" }}>No RSVP responses yet.</p>
      )}

      {!loading && !error && stats.length > 0 && (
        <div className="result-table-wrapper">
          <table className="result-table">
            <thead>
              <tr>
                <th>Program</th>
                <th>Event</th>
                <th>Date</th>
                <th>Day</th>
                <th>Total RSVP Count</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.programname}</td>
                  <td>{row.eventname}</td>
                  <td>{row.eventdate}</td>
                  <td>{row.eventday}</td>
                  <td>{row.totalRSVPs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
