import React, { useState } from "react";
import { addProgram } from "../api";
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
        progname: progName,
        progevent: [
          {
            eventname: eventName,
            eventdate: eventDate,
            eventday: eventDay,
            eventstatus: eventStatus,
          },
        ],
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
        {/* Program Name */}
        <select
          value={progName}
          onChange={(e) => setProgName(e.target.value)}
          required
        >
          <option value="">-- Select Program --</option>
          <option value="Anniversary">Anniversary</option>
          <option value="Diwali">Diwali</option>
          <option value="Mahavir Janma Kalyaanak">Mahavir Janma Kalyaanak</option>
          <option value="Paryushan">Paryushan</option>
          <option value="Pathshala">Pathshala</option>
        </select>

        {/* Event Name */}
        <select
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          required
        >
          <option value="">-- Select Event --</option>
          <option value="Navkarsi">Navkarsi</option>
          <option value="Afternoon Swamivatsalya">Afternoon Swamivatsalya</option>
          <option value="Evening Swamivatsalya">Evening Swamivatsalya</option>
        </select>

        {/* Event Date */}
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
        />

        {/* Event Day */}
        <input
          type="text"
          value={eventDay}
          onChange={(e) => setEventDay(e.target.value)}
          placeholder="Event Day (e.g. Monday)"
          required
        />

        {/* Event Status */}
        <select
          value={eventStatus}
          onChange={(e) => setEventStatus(e.target.value)}
          required
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
