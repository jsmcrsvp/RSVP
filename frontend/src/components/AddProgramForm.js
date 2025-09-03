import React, { useState } from "react";
import { addProgram } from "../api"; // we’ll create this in api.js
import "../styles/AddProgramForm.css";

function AddProgramForm() {
  const [progName, setProgName] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDay, setEventDay] = useState("");
  const [eventStatus, setEventStatus] = useState("Open");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const payload = {
        progName,
        progevent: [
          {
            eventName,
            eventDate,
            eventDay,
            eventStatus
          }
        ]
      };
      await addProgram(payload);
      setMessage("✅ Program added successfully!");
      // Clear form
      setProgName("");
      setEventName("");
      setEventDate("");
      setEventDay("");
      setEventStatus("Open");
    } catch (err) {
      setMessage(err.message || "❌ Failed to add program");
    }
  };

  return (
    <div className="add-program-container">
      <h2>Add Program & Event</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={progName}
          onChange={(e) => setProgName(e.target.value)}
          placeholder="Program Name"
          required
        />
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Event Name"
          required
        />
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
        />
        <input
          type="text"
          value={eventDay}
          onChange={(e) => setEventDay(e.target.value)}
          placeholder="Event Day (e.g. Monday)"
          required
        />
        <select
          value={eventStatus}
          onChange={(e) => setEventStatus(e.target.value)}
        >
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
          <option value="Completed">Completed</option>
        </select>
        <button type="submit">Add Program</button>
      </form>
    </div>
  );
}

export default AddProgramForm;
