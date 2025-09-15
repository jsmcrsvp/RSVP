// frontend/src/components/ActivateEventForm.js
import React, { useState, useEffect } from "react";
import {
  addProgram,
  getAllPrograms,
  updateEventStatus,
} from "../api";
import "../styles/ActivateEventForm.css"

// ✅ Utility to format YYYY-MM-DD → MM/DD/YYYY
  const displayDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
  };

const ActivateEventForm = () => {
  const [progname, setProgname] = useState("");
  const [eventname, setEventname] = useState("");
  const [eventdate, setEventdate] = useState("");
  const [eventday, setEventday] = useState("");
  const [eventstatus, setEventstatus] = useState("Open");
  const [rsvpClosedate, setRsvpClosedate] = useState("");

  const [testEventName, setTestEventName] = useState("");


  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // For editing event status
  const [editRow, setEditRow] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Auto-update eventDay when eventdate changes
  useEffect(() => {
    if (eventdate) {
      const date = new Date(eventdate + "T00:00:00Z");
      const day = date.toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "UTC",
      });
      setEventday(day);
    } else {
      setEventday("");
    }
  }, [eventdate]);

  // Fetch programs from DB
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

    if (!progname || !eventname || !eventdate || !eventday || !rsvpClosedate) {
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
            closersvp: rsvpClosedate,
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
      fetchPrograms();
    } catch (err) {
      console.error("Error activating event:", err);
      setError("❌ Failed to activate event.");
    }
  };

  // Save status change
  const handleSaveStatus = async (progId, evId) => {
    try {
      await updateEventStatus(progId, evId, newStatus);
      setSuccess("✅ Event status updated!");
      setEditRow(null);
      fetchPrograms();
    } catch (err) {
      console.error("Error updating event status:", err);
      setError("❌ Failed to update status.");
    }
  };

  return (
    <div className="add-program-container">
      <h3>Activate Program & Event</h3>

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
          <label>RSVP Close Date</label>
          <input
            type="date"
            value={rsvpClosedate}
            onChange={(e) => setRsvpClosedate(e.target.value)}
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

        <button type="submit" className="btn-submit">Add Program</button>
      </form>
      
      {/* Status messages */}
      {error && <p className="form-message error">{error}</p>}
      {success && <p className="form-message success">{success}</p>}


<form
  onSubmit={async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/programs/test-add-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_name: testEventName }),
      });

      const rawText = await res.text(); // Get raw response
      console.log("📥 Raw response from server:", rawText); // Log it

      const contentType = res.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        try {
          data = JSON.parse(rawText);
        } catch (err) {
          console.error("❌ Failed to parse JSON:", err);
          throw new Error("Invalid JSON format");
        }
      } else {
        console.error("❌ Server did not return JSON:", rawText);
        throw new Error("Server did not return valid JSON");
      }

      console.log("✅ Parsed response:", data);
      alert(data.message || "Event saved!");
      setTestEventName("");
    } catch (err) {
      console.error("❌ Error saving event:", err);
      alert("Error saving event: " + err.message);
    }
  }}
>
  <input
    type="text"
    value={testEventName}
    onChange={(e) => setTestEventName(e.target.value)}
    placeholder="Enter event name"
  />
  <button type="submit">Save Event</button>
</form>




      {/* Programs & Events Table */}
      {programs.length > 0 && (
        <div className="table-wrapper">
          <h3>Active Program & Event Details</h3>
          <table className="programs-table">
            <thead>
              <tr>
                <th>Program Name</th>
                <th>Event Name</th>
                <th>Event Date</th>
                <th>RSVP By</th>
                <th>Status</th>
                <th>Modify</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program, index) =>
                program.progevent.map((event, idx) => {
                  const rowKey = `${program._id}-${event._id}`;
                  const isFirst = idx === 0;

                  return (
                    <tr key={rowKey}>
                      {isFirst && (
                        <td rowSpan={program.progevent.length}>
                          {program.progname}
                        </td>
                      )}
                      <td>{event.eventname}</td>
                      <td>{event.eventday}, {displayDate(event.eventdate)}</td>
                      <td>{displayDate(event.closersvp)}</td>
                      <td>
                        {editRow === rowKey ? (
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                          >
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                            <option value="Completed">Completed</option>
                          </select>
                        ) : (
                          event.eventstatus
                        )}
                      </td>
                      <td>
                        {editRow === rowKey ? (
                          <button className="btn-save"
                            onClick={() =>
                              handleSaveStatus(program._id, event._id)
                            }
                          >
                            Save
                          </button>
                        ) : (
                          <input
                            type="checkbox"
                            onChange={() => {
                              setEditRow(rowKey);
                              setNewStatus(event.eventstatus);
                            }}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActivateEventForm;



/* frontend/src/components/AddProgramForm.js ====== Working 9/10/25 ======== 1pm ========
import React, { useState, useEffect } from "react";
import { addProgram, getAllPrograms } from "../api";
import "../styles/AddProgramForm.css";

// ✅ Utility to format YYYY-MM-DD → MM/DD/YYYY
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
  const [closersvp, setClosersvp] = useState("");

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auto-update eventDay when eventdate changes
  useEffect(() => {
    if (eventdate) {
      const date = new Date(eventdate + "T00:00:00Z");
      const day = date.toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "UTC",
      });
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
      setClosersvp("");
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
            value={closersvp}
            onChange={(e) => setClosersvp(e.target.value)}
            required
          />
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
                <th>RSVP Close</th>
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
*/


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