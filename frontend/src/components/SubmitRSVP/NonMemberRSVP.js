// frontend/src/pages/NonMemberRSVP.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const NonMemberRSVP = () => {
  const [form, setForm] = useState({
    memname: "",
    memaddress: "",
    memphonenumber: "",
    mememail: "",
  });
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch open events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("/api/programs/open-events"); // 👈 you should already have this endpoint
        setEvents(res.data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleEvent = (event) => {
    if (selectedEvents.find((e) => e.eventname === event.eventname)) {
      setSelectedEvents(selectedEvents.filter((e) => e.eventname !== event.eventname));
    } else {
      setSelectedEvents([...selectedEvents, { ...event, rsvpcount: 1 }]);
    }
  };

  const updateCount = (eventname, count) => {
    setSelectedEvents(
      selectedEvents.map((e) =>
        e.eventname === eventname ? { ...e, rsvpcount: count } : e
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const rsvpconfnumber = `NM-${Date.now()}`;

      await axios.post("/api/rsvp", {
        ...form,
        rsvpconfnumber,
        events: selectedEvents,
        isNonMember: true, // 👈 tell backend this is a non-member
      });

      setMessage("RSVP submitted successfully! Confirmation sent via email.");
      setForm({ memname: "", memaddress: "", memphonenumber: "", mememail: "" });
      setSelectedEvents([]);
    } catch (err) {
      console.error("Error submitting RSVP:", err);
      setMessage("Error submitting RSVP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Non-Member RSVP</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="memname"
          placeholder="Full Name"
          value={form.memname}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="memaddress"
          placeholder="Address"
          value={form.memaddress}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="memphonenumber"
          placeholder="Phone Number"
          value={form.memphonenumber}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="mememail"
          placeholder="Email Address"
          value={form.mememail}
          onChange={handleChange}
          required
        />

        <h3>Select Events</h3>
        {events.length === 0 && <p>No open events available.</p>}
        {events.map((ev) => (
          <div key={ev.eventname}>
            <label>
              <input
                type="checkbox"
                checked={!!selectedEvents.find((e) => e.eventname === ev.eventname)}
                onChange={() => toggleEvent(ev)}
              />
              {ev.programname} - {ev.eventname} ({ev.eventday}, {ev.eventdate})
            </label>
            {selectedEvents.find((e) => e.eventname === ev.eventname) && (
              <input
                type="number"
                min="1"
                value={
                  selectedEvents.find((e) => e.eventname === ev.eventname)?.rsvpcount || 1
                }
                onChange={(e) => updateCount(ev.eventname, parseInt(e.target.value))}
              />
            )}
          </div>
        ))}

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit RSVP"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default NonMemberRSVP;
