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
  const [programList, setProgramList] = useState([]);

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

        {/* Program List Table */}
        {programList.length > 0 && (
          <div className="program-list-table">
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
                {programList.map((program, index) =>
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
    </div>
  );
}

export default AddProgramForm;






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