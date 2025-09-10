// frontend/src/components/AddProgramForm.js
import React, { useState, useEffect } from "react";
import { addProgram, getAllPrograms } from "../api";
import "../styles/AddProgramForm.css";

// Utility to format YYYY-MM-DD → MM/DD/YYYY
const displayDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
};

const AddProgramForm = () => {
  const [progname, setProgname] = useState("");
  const [eventname, setEventname] = useState("");
  const [eventdate, setEventdate] = useState("");
  const [eventday, setEventday] = useState("");
  const [eventstatus, setEventstatus] = useState("Open");
  const [rsvpclosedate, setRsvpClosedate] = useState("");

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auto-update eventDay when eventdate changes
  useEffect(() => {
    if (eventdate) {
      const date = new Date(eventdate + "T00:00:00Z"); // UTC interpretation
      const day = date.toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "UTC",
      });
      setEventday(day);
    } else {
      setEventday("");
    }
  }, [eventdate]);

  // Fetch programs
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

    if (!progname || !eventname || !eventdate || !eventday || !closersvp) {
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
            closersvp,
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
      setRsvpClosedate("");
      fetchPrograms(); // Refresh list
    } catch (err) {
      console.error("Error adding program:", err);
      setError("❌ Failed to add program.");
    }
  };

  return (
    <div className="add-program-container">
      <h3>Activate Program & Event</h3>

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
            <option value="Mahavir Janma Kalyaanak">
              Mahavir Janma Kalyaanak
            </option>
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
            <option value="Afternoon Swamivatsalya">
              Afternoon Swamivatsalya
            </option>
            <option value="Evening Swamivatsalya">
              Evening Swamivatsalya
            </option>
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
          <input type="text" value={eventday} readOnly />
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

        <div className="form-group">
          <label>RSVP Close Date</label>
          <input
            type="date"
            value={rsvpClosedate}
            onChange={(e) => setRsvpClosedate(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Program</button>
      </form>

      {/* Table */}
      {programs.length > 0 && (
        <div className="result-table-wrapper">
          <h3>Active Program & Event Details</h3>
          <table className="result-table">
            <thead>
              <tr>
                <th>Program Name</th>
                <th>Event Name</th>
                <th>Date</th>
                <th>Day</th>
                <th>Status</th>
                <th>RSVP By</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program, index) =>
                program.progevent.map((event, idx) => (
                  <tr key={`${index}-${idx}`}>
                    {idx === 0 && (
                      <td rowSpan={program.progevent.length}>
                        {program.progname}
                      </td>
                    )}
                    <td>{event.eventname}</td>
                    <td>{displayDate(event.eventdate)}</td>
                    <td>{event.eventday}</td>
                    <td>{event.eventstatus}</td>
                    <td>{event.closersvp}</td>
                    <td>{displayDate(event.closersvp)}</td>
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

/*
                    <td>{event.eventname}</td>
                    <td>{displayDate(event.eventdate)}</td>
                    <td>{event.eventdate}</td>
                    <td>{event.eventday}</td>
                    <td>{event.eventstatus}</td>
                    <td>{event.closersvp}</td>*/

/* frontend/src/components/AddProgramForm.js ===== Working 091025 === 8am
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


  // Auto-update eventDay when eventdate changes
  useEffect(() => {
    if (eventdate) {
      const date = new Date(eventdate + "T00:00:00Z"); // Ensures UTC interpretation
      const day = date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
      setEventday(day);
    } else {
      setEventday("");
    }
  }, [eventdate]);

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
      <h3>Activate Program & Event</h3>

      {/* ✅ Status messages
      {error && <p className="form-message error">{error}</p>}
      {success && <p className="form-message success">{success}</p>}

      {/* Program Form
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
            readOnly
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

      {/* Table
      {programs.length > 0 && (
        <div className="result-table-wrapper">
          <h3>Active Program & Event Details</h3>
          <table className="result-table">
            <thead>
              <tr>
                <th>Program Name</th>
                <th>Event Name</th>
                <th>Date</th>
                <th>Day</th>
                <th>Status</th>
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
*/