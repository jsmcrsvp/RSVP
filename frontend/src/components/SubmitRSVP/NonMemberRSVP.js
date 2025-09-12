// frontend/src/pages/NonMemberRSVP.js
import React, { useState, useEffect } from "react";
import { fetchOpenEvents, submitRSVP } from "../api";
import "../styles/SubmitRSVP.css";

export default function NonMemberRSVP({ onHome }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchOpenEvents();
        setEvents(data || []);
      } catch (err) {
        console.error("Error loading events:", err);
      }
    };
    loadEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await submitRSVP({
        name,
        address,
        phone,
        email,
        rsvpEntries: events.map((ev) => ({
          eventId: ev._id,
          rsvpcount: ev.rsvpcount || 0,
        })),
      });

      setSubmitted(true);
      setMessage("RSVP submitted successfully!");
    } catch (err) {
      setMessage("Error submitting RSVP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="rsvp-form" onSubmit={handleSubmit}>
      <h3>Non-Member RSVP</h3>
      <div className="inline-fields">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>
      <div className="inline-fields">
        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <h4>Open Events</h4>
      {events.length > 0 ? (
        <table className="result-table">
          <thead>
            <tr>
              <th>Program</th>
              <th>Event</th>
              <th>Date</th>
              <th>RSVP</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev, idx) => (
              <tr key={ev._id || idx}>
                <td>{ev.programname}</td>
                <td>{ev.eventname}</td>
                <td>{ev.eventday}, {ev.eventdate}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={ev.rsvpcount || 0}
                    onChange={(e) => {
                      const newEvents = [...events];
                      newEvents[idx].rsvpcount = e.target.value;
                      setEvents(newEvents);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No open events.</p>
      )}

      <div className="form-actions">
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit RSVP"}
        </button>
        <button type="button" onClick={onHome}>
          Home
        </button>
      </div>

      {submitted && <div className="success-message">{message}</div>}
      {!submitted && message && <div className="error-message">{message}</div>}
    </form>
  );
}
