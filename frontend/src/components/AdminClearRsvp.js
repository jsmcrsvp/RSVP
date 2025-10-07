import React, { useState, useEffect } from "react";
import { getCompletedEvent, clearRSVP } from "../api";
import "../styles/Admin.css";

const AdminClearRsvp = () => {
  const [completedEvent, setCompletedEvent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch completed event name on load
  useEffect(() => {
    const fetchCompletedEvent = async () => {
      try {
        const data = await getCompletedEvent();
        if (data?.eventName) {
          setCompletedEvent(data.eventName);
        } else {
          setMessage("No completed events found");
        }
      } catch (err) {
        console.error("❌ Error fetching completed event:", err);
        setMessage("Failed to fetch completed event");
      }
    };
    fetchCompletedEvent();
  }, []);

  // Handle Clear RSVP
  const handleClearRSVP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await clearRSVP();
      setMessage(data.message || "RSVP data cleared successfully");
    } catch (err) {
      console.error("❌ Error clearing RSVP:", err);
      setMessage(err.response?.data?.error || "Failed to clear RSVP data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Clear RSVP for Completed Event</h3>
      {completedEvent && (
        <p>
          <strong>Completed Event:</strong> {completedEvent}
        </p>
      )}

      <form onSubmit={handleClearRSVP}>
        <button
          type="submit"
          disabled={loading || !completedEvent}
          style={{ padding: "0.5rem 1rem" }}
        >
          {loading ? "Clearing..." : "Clear RSVP"}
        </button>
      </form>

      {message && (
        <p style={{ color: message.includes("successfully") ? "green" : "red" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AdminClearRSVP;
