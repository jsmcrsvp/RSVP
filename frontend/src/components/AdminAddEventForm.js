import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminAddEvent = () => {
  const [eventName, setEventName] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch existing events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("/api/add_events");
        setEvents(res.data);
      } catch (err) {
        console.error("❌ Error fetching events:", err);
        setMessage("Failed to load existing events");
      }
    };
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventName.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("/api/add_events", { event_name: eventName.trim() });

      setEvents([res.data.event, ...events]);
      setMessage(res.data.message || "Event added successfully");
      setEventName("");
    } catch (err) {
      console.error("❌ Error adding event:", err);
      setMessage(err.response?.data?.error || "Failed to add event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Admin: Add Event</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Event Name:</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
      </form>

      {message && <p>{message}</p>}

      <hr />
      <h3>Existing Events</h3>
      <ul>
        {events.map((e) => (
          <li key={e._id}>{e.event_name}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminAddEvent;
