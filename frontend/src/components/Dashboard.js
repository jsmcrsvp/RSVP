// frontend/src/components/Dashboard.js
import React, { useEffect, useState } from "react";
import { getOpenEvents, getDashboardStats } from "../api";
import "../styles/SubmitRSVP.css";

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Load all RSVP stats
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

  // Load open events
  useEffect(() => {
    (async () => {
      setLoadingEvents(true);
      try {
        console.log("Loading open events...");
        const data = await getOpenEvents();
        setEvents(Array.isArray(data) ? data : []);
        console.log("Open events loaded:", Array.isArray(data) ? data.length : 0);
      } catch (err) {
        console.error("Failed to load open events:", err);
        setError("Failed to load open events.");
      } finally {
        setLoadingEvents(false);
      }
    })();
  }, []);

  // ✅ Filter stats by open events
  const filteredStats = stats.filter((row) =>
    events.some(
      (ev) =>
        ev.programname === row.programname &&
        ev.eventname === row.eventname &&
        ev.eventdate === row.eventdate &&
        ev.eventday === row.eventday
    )
  );

  return (
    <div className="dashboard-container">
      <h3>Current RSVP Stats (Open Events Only)</h3>

      {(loading || loadingEvents) && <p>Loading dashboard...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !loadingEvents && !error && filteredStats.length === 0 && (
        <p style={{ fontStyle: "italic", color: "#666" }}>
          No RSVP responses for open events yet.
        </p>
      )}

      {!loading && !loadingEvents && !error && filteredStats.length > 0 && (
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
              {filteredStats.map((row, idx) => (
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



/* frontend/src/components/Dashboard.js
import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../api";
import "../styles/SubmitRSVP.css"; // or a dashboard-specific css if you prefer

export default function Dashboard() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [events, setEvents] = useState([]);

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
*/