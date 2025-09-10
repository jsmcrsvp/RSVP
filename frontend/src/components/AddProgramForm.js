// frontend/src/components/AddProgramForm.js
import React, { useState, useEffect } from "react";
import { addProgram, getAllPrograms } from "../api";
import "../styles/AddProgramForm.css";

const AddProgramForm = () => {
  const [progname, setProgname] = useState("");
  const [eventname, setEventname] = useState("");
  const [eventdate, setEventdate] = useState("");
  const [eventday, setEventday] = useState("");
  const [eventstatus, setEventstatus] = useState("Open");

  const [programs, setPrograms] = useState([]); // ✅ renamed from programList
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch programs on mount
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await getAllPrograms();
      setPrograms(data);
    } catch (err) {
      console.error("Error fetching programs:", err);
      setError("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!progname || !eventname || !eventdate || !eventday) {
      setError("All fields are required.");
      return;
    }

    try {
      const payload = {
        progname,
        progevent: [
          {
            eventname,
            eventdate,
            eventday,
            eventstatus,
          },
        ],
      };

      await addProgram(payload);
      setSuccess("✅ Program & Event added successfully!");
      setProgname("");
      setEventname("");
      setEventdate("");
      setEventday("");
      setEventstatus("Open");
      fetchPrograms(); // Refresh list
    } catch (err) {
      console.error("Error adding program:", err);
      setError("❌ Failed to add program.");
    }
  };

  return (
    <div className="add-program-container">
      <h2>Add Program & Event</h2>

      {/* ✅ Status messages */}
      {error && <p className="form-message error">{error}</p>}
      {success && <p className="form-message success">{success}</p>}

      {/* Program Form */}
      <form className="program-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Program</label>
          <select
            value={progname}
            onChange={(e) => setProgname(e.target.value)}
            required
          >
            <option value="">-- Select Program --</option>
            <option value="Anniversary">Anniversary</option>
            <option value="Diwali">Diwali</option>
            <option value="Mahavir Janma Kalyaanak">Mahavir Janma Kalyaanak</option>
            <option value="Paryushan">Paryushan</option>
            <option value="Pathshala">Pathshala</option>
          </select>
        </div>

        <div className="form-group">
          <label>Select Event</label>
          <select
            value={eventname}
            onChange={(e) => setEventname(e.target.value)}
            required
          >
            <option value="">-- Select Event --</option>
            <option value="Navkarsi">Navkarsi</option>
            <option value="Afternoon Swamivatsalya">Afternoon Swamivatsalya</option>
            <option value="Evening Swamivatsalya">Evening Swamivatsalya</option>
          </select>
        </div>

        <div className="form-group">
          <label>Event Date</label>
          <input
            type="date"
            value={eventdate}
            onChange={(e) => setEventdate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Event Day</label>
          <input
            type="text"
            value={eventday}
            onChange={(e) => setEventday(e.target.value)}
            placeholder="Event Day (e.g. Monday)"
            required
          />
        </div>

        <div className="form-group">
          <label>Event Status</label>
          <select
            value={eventstatus}
            onChange={(e) => setEventstatus(e.target.value)}
            required
          >
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <button type="submit">Add Program</button>
      </form>

      {/* Table */}
      {programs.length > 0 && (
        <div className="table-container">
          <h3>Program & Event Details</h3>
          <table>
            <thead>
              <tr>
                <th>Program Name</th>
                <th>Event Name</th>
                <th>Event Date</th>
                <th>Event Day</th>
                <th>Event Status</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program, index) =>
                program.progevent.map((event, idx) => (
                  <tr key={`${index}-${idx}`}>
                    <td>{program.progname}</td>
                    <td>{event.eventname}</td>
                    <td>{event.eventdate}</td>
                    <td>{event.eventday}</td>
                    <td>{event.eventstatus}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AddProgramForm;
