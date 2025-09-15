import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminFunctionForm.css";

const AdminFunctionForm = () => {
  const [program, setProgram] = useState("");
  const [event, setEvent] = useState("");
  const [message, setMessage] = useState("");

  const [existingPrograms, setExistingPrograms] = useState([]);
  const [existingEvents, setExistingEvents] = useState([]);

  // ✅ Fetch existing Programs and Events for duplicate check
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programRes, eventRes] = await Promise.all([
          axios.get("/api/programs-events/programs"),
          axios.get("/api/programs-events/events"),
        ]);
        setExistingPrograms(programRes.data || []);
        setExistingEvents(eventRes.data || []);
      } catch (error) {
        console.error("Error fetching existing programs/events:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // ✅ Check for duplicates before submit
    if (existingPrograms.some((p) => p.program_name.toLowerCase() === program.toLowerCase())) {
      setMessage(`⚠️ Program "${program}" already exists.`);
      return;
    }
    if (existingEvents.some((ev) => ev.event_name.toLowerCase() === event.toLowerCase())) {
      setMessage(`⚠️ Event "${event}" already exists.`);
      return;
    }

    try {
      await axios.post("/api/programs-events/add", {
        program_name: program,
        event_name: event,
      });

      setMessage("✅ Program & Event added successfully!");
      setProgram("");
      setEvent("");

      // Refresh local lists after successful add
      const [programRes, eventRes] = await Promise.all([
        axios.get("/api/programs-events/programs"),
        axios.get("/api/programs-events/events"),
      ]);
      setExistingPrograms(programRes.data || []);
      setExistingEvents(eventRes.data || []);

    } catch (error) {
      console.error("Error adding Program & Event:", error);
      setMessage("❌ Failed to add Program & Event.");
    }
  };

  return (
    <div className="add-program-container">
      <h2>Admin – Create New Program & Event</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Program:</label>
          <input
            type="text"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Event:</label>
          <input
            type="text"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <button type="submit" className="submit-button">
          Add Program & Event
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}
    </div>
  );
};

export default AdminFunctionForm;
