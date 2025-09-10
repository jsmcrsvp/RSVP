// frontend/src/components/AddProgramForm.js
import React, { useState, useEffect } from "react";
import { addProgram, getAllPrograms } from "../api";

const AddProgramForm = () => {
  const [progname, setProgname] = useState("");
  const [eventname, setEventname] = useState("");
  const [eventdate, setEventdate] = useState("");
  const [eventday, setEventday] = useState("");
  const [eventstatus, setEventstatus] = useState("Open");
  const [programs, setPrograms] = useState([]);
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
      setSuccess("Program & Event added successfully!");
      setProgname("");
      setEventname("");
      setEventdate("");
      setEventday("");
      setEventstatus("Open");
      fetchPrograms(); // Refresh list
    } catch (err) {
      console.error("Error adding program:", err);
      setError("Failed to add program.");
    }
  };

  return (
    <div className="add-program">
      <h2>Add Program & Event</h2>

      <form onSubmit={handleSubmit} className="program-form">
        <div>
          <label>Program Name:</label>
          <input
            type="text"
            value={progname}
            onChange={(e) => setProgname(e.target.value)}
          />
        </div>
        <div>
          <label>Event Name:</label>
          <input
            type="text"
            value={eventname}
            onChange={(e) => setEventname(e.target.value)}
          />
        </div>
        <div>
          <label>Event Date:</label>
          <input
            type="date"
            value={eventdate}
            onChange={(e) => setEventdate(e.target.value)}
          />
        </div>
        <div>
          <label>Event Day:</label>
          <input
            type="text"
            value={eventday}
            onChange={(e) => setEventday(e.target.value)}
          />
        </div>
        <div>
          <label>Status:</label>
          <select
            value={eventstatus}
            onChange={(e) => setEventstatus(e.target.value)}
          >
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <button type="submit">Add Program</button>
      </form>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <h3>Existing Programs & Events</h3>
      <button onClick={fetchPrograms} disabled={loading}>
        {loading ? "Refreshing..." : "Refresh"}
      </button>

      {programs.length === 0 ? (
        <p>No programs added yet.</p>
      ) : (
        <table className="programs-table">
          <thead>
            <tr>
              <th>Program</th>
              <th>Event Name</th>
              <th>Event Date</th>
              <th>Event Day</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((prog) =>
              prog.progevent.map((ev, idx) => (
                <tr key={`${prog._id}-${idx}`}>
                  <td>{prog.progname}</td>
                  <td>{ev.eventname}</td>
                  <td>{ev.eventdate}</td>
                  <td>{ev.eventday}</td>
                  <td>{ev.eventstatus}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AddProgramForm;



/*
import React, { useState } from "react";
import { addProgram, getAllEvents } from "../api";
import "../styles/AddProgramForm.css";

function AddProgramForm() {
  const [progName, setProgName] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDay, setEventDay] = useState("");
  const [eventStatus, setEventStatus] = useState("Open");
  const [message, setMessage] = useState("");
  const [programList, setProgramList] = useState([]);

  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await api.get("/api/programs/all");
        setPrograms(res.data); // ✅ now contains all events
      } catch (err) {
        console.error("Error fetching programs:", err);
      }
    };

    fetchPrograms();
  }, []);

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

      // Add to local list
      setProgramList((prevList) => [...prevList, payload]);

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
    <div className="page-wrapper">
      <div className="add-program-container">
        <h2>Add Program & Event</h2>

        {message && <p className="form-message">{message}</p>}

        <form className="program-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Program</label>
            <select value={progName} onChange={(e) => setProgName(e.target.value)} required>
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
            <select value={eventName} onChange={(e) => setEventName(e.target.value)} required>
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
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Event Day</label>
            <input
              type="text"
              value={eventDay}
              onChange={(e) => setEventDay(e.target.value)}
              placeholder="Event Day (e.g. Monday)"
              required
            />
          </div>

          <div className="form-group">
            <label>Event Status</label>
            <select value={eventStatus} onChange={(e) => setEventStatus(e.target.value)} required>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <button type="submit">Add Program</button>
        </form>

        {/* Program List Table
        <h3>Existing Events</h3>
        <table>
          <thead>
            <tr>
              <th>Program Name</th>
              <th>Event Name</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((p) => (
              <tr key={p._id}>
                <td>{p.programname}</td>
                <td>{p.eventname}</td>
                <td>{p.eventdate}</td>
                <td>{p.eventstatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AddProgramForm;
*/





/*
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
          { eventname: eventName, eventdate: eventDate, eventday: eventDay, eventstatus: eventStatus }
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
        <select value={progName} onChange={(e) => setEventStatus(e.target.value)}>
          <option value="Open">Anniversary</option>
          <option value="Closed">Diwali</option>
          <option value="Completed">Mahavir Janma Kalyaanak</option>
          <option value="Completed">Paryushan</option>
          <option value="Completed">Pathshala</option>
        </select>
        <select value={eventName} onChange={(e) => setEventStatus(e.target.value)}>
          <option value="Open">Navkarsi</option>
          <option value="Closed">Afternoon Swamivatsalya</option>
          <option value="Completed">Evening Swamivatsalya</option>
        </select>
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
        <select value={eventStatus} onChange={(e) => setEventStatus(e.target.value)}>
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
*/