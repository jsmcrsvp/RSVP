import React, { useState } from "react";

const AddProgramForm = () => {
  const [progname, setProgname] = useState("");
  const [events, setEvents] = useState([
    { eventname: "", eventdate: "", eventday: "", eventstatus: "Open" },
  ]);

  // Handle input change for event fields
  const handleEventChange = (index, field, value) => {
    const updatedEvents = [...events];
    updatedEvents[index][field] = value;
    setEvents(updatedEvents);
  };

  // Add new event row
  const addEvent = () => {
    setEvents([
      ...events,
      { eventname: "", eventdate: "", eventday: "", eventstatus: "Open" },
    ]);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progname, progevent: events }),
      });

      if (response.ok) {
        alert("Program added successfully!");
        setProgname("");
        setEvents([{ eventname: "", eventdate: "", eventday: "", eventstatus: "Open" }]);
      } else {
        alert("Failed to add program.");
      }
    } catch (error) {
      console.error("Error adding program:", error);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "80%",
          maxWidth: "700px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          background: "#fff",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Add Program</h2>

        {/* Program Name */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold" }}>Program Name:</label>
          <input
            type="text"
            value={progname}
            onChange={(e) => setProgname(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Events */}
        <h3>Events</h3>
        {events.map((event, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <input
              type="text"
              placeholder="Event Name"
              value={event.eventname}
              onChange={(e) => handleEventChange(index, "eventname", e.target.value)}
              required
            />
            <input
              type="date"
              value={event.eventdate}
              onChange={(e) => handleEventChange(index, "eventdate", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Day"
              value={event.eventday}
              onChange={(e) => handleEventChange(index, "eventday", e.target.value)}
              required
            />
            <select
              value={event.eventstatus}
              onChange={(e) => handleEventChange(index, "eventstatus", e.target.value)}
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        ))}

        <button
          type="button"
          onClick={addEvent}
          style={{
            padding: "8px 15px",
            marginBottom: "15px",
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          + Add Event
        </button>

        <br />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#1976d2",
            color: "#fff",
            fontWeight: "bold",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Save Program
        </button>
      </form>
    </div>
  );
};

export default AddProgramForm;
