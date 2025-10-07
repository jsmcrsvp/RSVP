import React, { useState, useEffect } from "react";
import { getCompletedEvents, clearRSVP } from "../api";

const AdminClearRsvp = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getCompletedEvents();
        setEvents(data.events || []);
      } catch (err) {
        console.error("❌ Error fetching completed events:", err);
        setMessage("Failed to load completed events");
      }
    };
    fetchEvents();
  }, []);

  const toggleSelect = (name) => {
    setSelectedEvents(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleClear = async (eventName) => {
    if (!window.confirm(`Are you sure you want to clear RSVPs for "${eventName}"?`)) return;
    setLoading(true);
    setMessage("");
    try {
      const data = await clearRSVP(eventName);
      setMessage(data.message);
      setEvents(events.filter(e => e.event_name !== eventName));
      setSelectedEvents(prev => {
        const copy = { ...prev };
        delete copy[eventName];
        return copy;
      });
    } catch (err) {
      console.error("❌ Error clearing RSVP:", err);
      setMessage("Failed to clear RSVP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Clear RSVP for Completed Events</h3>
      {message && <div style={{ color: "green", marginBottom: "1rem" }}>{message}</div>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Select</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>No completed events found</td>
            </tr>
          ) : (
            events.map((ev, idx) => (
              <tr key={idx}>
                <td>{ev.event_name}</td>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={!!selectedEvents[ev.event_name]}
                    onChange={() => toggleSelect(ev.event_name)}
                  />
                </td>
                <td>
                  {selectedEvents[ev.event_name] && (
                    <button onClick={() => handleClear(ev.event_name)} disabled={loading}>
                      {loading ? "Clearing..." : "Clear"}
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminClearRsvp;
