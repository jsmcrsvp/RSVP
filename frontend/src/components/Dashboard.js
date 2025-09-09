import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../api"; // 👈 backend API function

function Dashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getDashboardStats(); // call backend
        setStats(data);
      } catch (err) {
        setError("Failed to load RSVP stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="dashboard-container">
      <h3>Current RSVP Stats</h3>
      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Total RSVPs</th>
            <th>Yes</th>
            <th>No</th>
            <th>Maybe</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((row, idx) => (
            <tr key={idx}>
              <td>{row.eventname}</td>
              <td>{row.total}</td>
              <td>{row.yes}</td>
              <td>{row.no}</td>
              <td>{row.maybe}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
