import React, { useState } from "react";
import axios from "axios";
import "../styles/AddProgramEventForm.css"

const AddProgramEventForm = () => {
  const [program, setProgram] = useState("");
  const [event, setEvent] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/api/program-events", { program, event });
      setMessage("Program & Event added successfully!");
      setProgram("");
      setEvent("");
    } catch (error) {
      console.error("Error adding Program & Event:", error);
      setMessage("Failed to add Program & Event.");
    }
  };

  return (
    <div className="add-program-container">
      <h2>Create New Program & Event</h2>
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

      {message && <p className="success-message">{message}</p>}
    </div>
  );
};

export default AddProgramEventForm;
