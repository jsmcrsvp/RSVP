// frontend/src/components/ActivateEventForm.js
import React, { useState, useEffect } from "react";
import { getAllPrograms, getAdminAllPrograms, getAllEvents, addProgram, updateEventStatus, } from "../api";
import "../styles/ActivateEventForm.css";

const displayDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
};

const safeString = (v) => (v == null ? "" : String(v).trim());
const extractProgramName = (p) =>
  safeString(
    p?.program_name ??
    p?.progname ??
    p?.progName ??
    p?.name ??
    p?.program ??
    p
  );
const extractEventName = (e) =>
  safeString(
    e?.event_name ??
    e?.eventname ??
    e?.evname ??
    e?.name ??
    e?.event ??
    e
  );
const extractId = (obj, fallback) => obj?._id ?? obj?.id ?? fallback ?? null;

export default function ActivateEventForm() {
  const [progname, setProgname] = useState("");
  const [eventname, setEventname] = useState("");
  const [eventdate, setEventdate] = useState("");
  const [eventday, setEventday] = useState("");
  const [eventstatus, setEventstatus] = useState("Open");
  const [rsvpClosedate, setRsvpClosedate] = useState("");

  const [programsList, setProgramsList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [activePrograms, setActivePrograms] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editRow, setEditRow] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Update Event Day when Event Date changes
  useEffect(() => {
    if (eventdate) {
      const d = new Date(eventdate + "T00:00:00Z");
      const day = d.toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "UTC",
      });
      setEventday(day);
    } else setEventday("");
  }, [eventdate]);

  const fetchProgramsAndEvents = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const [
        rawProgramList,
        rawEventList,
        rawProgramsCollection,
      ] = await Promise.all([
        (async () => {
          try {
            return await getAdminAllPrograms();
          } catch {
            return [];
          }
        })(),
        (async () => {
          try {
            return await getAllEvents();
          } catch {
            return [];
          }
        })(),
        (async () => {
          try {
            return await getAllPrograms();
          } catch {
            return [];
          }
        })(),
      ]);

      const normalizedProgramsList = (Array.isArray(rawProgramList)
        ? rawProgramList
        : [])
        .map((p) => ({
          id: extractId(p, extractProgramName(p)),
          name: extractProgramName(p),
        }))
        .filter((p) => p.name)
        .sort((a, b) => a.name.localeCompare(b.name));

      const normalizedEventsList = (Array.isArray(rawEventList)
        ? rawEventList
        : [])
        .map((e) => ({
          id: extractId(e, extractEventName(e)),
          name: extractEventName(e),
        }))
        .filter((e) => e.name)
        .sort((a, b) => a.name.localeCompare(b.name));

      const normalizedActivePrograms = (Array.isArray(rawProgramsCollection)
        ? rawProgramsCollection
        : [])
        .map((p) => {
          const progName = extractProgramName(p);
          const progId = extractId(p, progName);
          const rawProgevents = Array.isArray(p?.progevent) ? p.progevent : [];

          const activeProgevents = rawProgevents
            .map((ev) => ({
              id: extractId(ev, extractEventName(ev)),
              name: extractEventName(ev),
              eventdate: safeString(ev?.eventdate ?? ev?.date),
              eventday: safeString(ev?.eventday ?? ev?.day),
              status: safeString(
                ev?.eventstatus ?? ev?.status ?? ev?.event_status
              ),
              closersvp: safeString(ev?.closersvp ?? ev?.closersvp),
            }))
            .filter((ev) =>
              ["Open", "Closed", "Completed"].includes(ev.status)
            );

          return {
            id: progId ?? progName,
            name: progName,
            progevent: activeProgevents,
          };
        })
        .filter((p) => Array.isArray(p.progevent) && p.progevent.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name));

      setProgramsList(normalizedProgramsList);
      setEventsList(normalizedEventsList);
      setActivePrograms(normalizedActivePrograms);
    } catch (err) {
      console.error("Error fetching programs/events:", err);
      setError("Failed to load programs/events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramsAndEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!progname || !eventname || !eventdate || !eventday || !rsvpClosedate) {
      setError("All fields are required.");
      return;
    }

    try {
      await addProgram({
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
      });

      setSuccess("✅ Program & Event activated successfully!");
      setProgname("");
      setEventname("");
      setEventdate("");
      setEventday("");
      setEventstatus("Open");
      setRsvpClosedate("");
      await fetchProgramsAndEvents();
    } catch (err) {
      console.error("Error activating event:", err);
      setError("❌ Failed to activate event.");
    }
  };

  const handleSaveStatus = async (programId, eventId) => {
    try {
      await updateEventStatus(programId, eventId, newStatus);
      setSuccess("✅ Event status updated!");
      setEditRow(null);
      await fetchProgramsAndEvents();
    } catch (err) {
      console.error("Error updating event status:", err);
      setError("❌ Failed to update status.");
    }
  };

  // Split into Open & Closed events (like Dashboard)
  const openEvents = [];
  const closedEvents = [];
  activePrograms.forEach((program) => {
    program.progevent.forEach((ev) => {
      const row = { program, ev };
      if (ev.status === "Open") openEvents.push(row);
      if (ev.status === "Closed") closedEvents.push(row);
    });
  });

  return (
    <div className="add-program-container">
      <h3>Manage Program & Event</h3>

      <form className="program-form" onSubmit={handleSubmit}>
        {/* Row 1 */}
        <div className="form-row">
          <div className="form-group">
            <label>Select Program</label>
            <select
              value={progname}
              onChange={(e) => setProgname(e.target.value)}
              required
            >
              <option value="">-- Select Program --</option>
              {programsList.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
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
              {eventsList.map((ev) => (
                <option key={ev.id} value={ev.name}>
                  {ev.name}
                </option>
              ))}
            </select>
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
            </select>
          </div>
        </div>

        {/* Row 2 */}
        <div className="form-row">
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
        </div>

        {/* Row 3 */}
        <div className="form-row" style={{ justifyContent: "center" }}>
          <button type="submit" className="btn-submit">
            Update Event
          </button>
        </div>
      </form>

      {/* Messages */}
      {error && <p className="form-message error">{error}</p>}
      {success && <p className="form-message success">{success}</p>}

      {/* Open Events Table */}
      {openEvents.length > 0 && (
        <div className="table-wrapper">
          <h3>Current Open Events</h3>
          <div className="result-table-wrapper">
            <table className="result-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Event</th>
                  <th>Event Date</th>
                  <th>RSVP By</th>
                  <th>Status</th>
                  <th>Modify</th>
                </tr>
              </thead>
              <tbody>
                {openEvents.map(({ program, ev }) => {
                  const rowKey = `${program.id}-${ev.id}`;
                  return (
                    <tr key={rowKey}>
                      <td>{program.name}</td>
                      <td>{ev.name}</td>
                      <td>
                        {ev.eventday}, {displayDate(ev.eventdate)}
                      </td>
                      <td>{displayDate(ev.closersvp)}</td>
                      <td>
                        {editRow === rowKey ? (
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                          >
                            <option value="">-- Select Status --</option>
                            <option value="Closed">Closed</option>
                            <option value="Completed">Completed</option>
                          </select>
                        ) : (
                          ev.status
                        )}
                      </td>
                      <td>
                        {editRow === rowKey ? (
                          <button
                            className="btn-save"
                            onClick={() =>
                              handleSaveStatus(program.id, ev.id)
                            }
                          >
                            Save
                          </button>
                        ) : (
                          <input
                            type="checkbox"
                            onChange={() => {
                              setEditRow(rowKey);
                              //setNewStatus(ev.status);
                              setNewStatus("");  // force user to pick a new status
                            }}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Closed Events Table */}
      {closedEvents.length > 0 && (
        <div className="table-wrapper">
          <h3>Current Closed Events</h3>
          <div className="result-table-wrapper">
            <table className="result-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Event</th>
                  <th>Event Date</th>
                  <th>RSVP By</th>
                  <th>Status</th>
                  <th>Modify</th>
                </tr>
              </thead>
              <tbody>
                {closedEvents.map(({ program, ev }) => {
                  const rowKey = `${program.id}-${ev.id}`;
                  return (
                    <tr key={rowKey}>
                      <td>{program.name}</td>
                      <td>{ev.name}</td>
                      <td>
                        {ev.eventday}, {displayDate(ev.eventdate)}
                      </td>
                      <td>{displayDate(ev.closersvp)}</td>
                      <td>
                        {editRow === rowKey ? (
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                          >
                            <option value="">-- Select Status --</option>
                            <option value="Open">Open</option>
                            <option value="Completed">Completed</option>
                          </select>
                        ) : (
                          ev.status
                        )}
                      </td>
                      <td>
                        {editRow === rowKey ? (
                          <button
                            className="btn-save"
                            onClick={() =>
                              handleSaveStatus(program.id, ev.id)
                            }
                          >
                            Save
                          </button>
                        ) : (
                          <input
                            type="checkbox"
                            onChange={() => {
                              setEditRow(rowKey);
                              //setNewStatus(ev.status);
                              setNewStatus("");  // force user to pick a new status
                            }}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
          )}
        </div>
      );
}

/* frontend/src/components/ActivateEventForm.js
import React, { useState, useEffect } from "react";
import { getAllPrograms, getAdminAllPrograms, getAllEvents, addProgram, updateEventStatus, } from "../api";
import "../styles/ActivateEventForm.css";

const displayDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
};

const safeString = (v) => (v == null ? "" : String(v).trim());
const extractProgramName = (p) =>
  safeString(p?.program_name ?? p?.progname ?? p?.progName ?? p?.name ?? p?.program ?? p);
const extractEventName = (e) =>
  safeString(e?.event_name ?? e?.eventname ?? e?.evname ?? e?.name ?? e?.event ?? e);
const extractId = (obj, fallback) => obj?._id ?? obj?.id ?? fallback ?? null;

export default function ActivateEventForm() {
  const [progname, setProgname] = useState("");
  const [eventname, setEventname] = useState("");
  const [eventdate, setEventdate] = useState("");
  const [eventday, setEventday] = useState("");
  const [eventstatus, setEventstatus] = useState("Open");
  const [rsvpClosedate, setRsvpClosedate] = useState("");

  const [programsList, setProgramsList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [activePrograms, setActivePrograms] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editRow, setEditRow] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Update Event Day when Event Date changes
  useEffect(() => {
    if (eventdate) {
      const d = new Date(eventdate + "T00:00:00Z");
      const day = d.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
      setEventday(day);
    } else setEventday("");
  }, [eventdate]);

  const fetchProgramsAndEvents = async () => {
    try {
      setLoading(true);
      setError(""); setSuccess("");

      const [rawProgramList, rawEventList, rawProgramsCollection] = await Promise.all([
        (async () => { try { return await getAdminAllPrograms(); } catch { return []; } })(),
        (async () => { try { return await getAllEvents(); } catch { return []; } })(),
        (async () => { try { return await getAllPrograms(); } catch { return []; } })(),
      ]);

      const normalizedProgramsList = (Array.isArray(rawProgramList) ? rawProgramList : [])
        .map((p) => ({ id: extractId(p, extractProgramName(p)), name: extractProgramName(p) }))
        .filter((p) => p.name)
        .sort((a, b) => a.name.localeCompare(b.name));

      const normalizedEventsList = (Array.isArray(rawEventList) ? rawEventList : [])
        .map((e) => ({ id: extractId(e, extractEventName(e)), name: extractEventName(e) }))
        .filter((e) => e.name)
        .sort((a, b) => a.name.localeCompare(b.name));

      const normalizedActivePrograms = (Array.isArray(rawProgramsCollection) ? rawProgramsCollection : [])
        .map((p) => {
          const progName = extractProgramName(p);
          const progId = extractId(p, progName);
          const rawProgevents = Array.isArray(p?.progevent) ? p.progevent : [];

          const activeProgevents = rawProgevents
            .map((ev) => ({
              id: extractId(ev, extractEventName(ev)),
              name: extractEventName(ev),
              eventdate: safeString(ev?.eventdate ?? ev?.date),
              eventday: safeString(ev?.eventday ?? ev?.day),
              status: safeString(ev?.eventstatus ?? ev?.status ?? ev?.event_status),
              closersvp: safeString(ev?.closersvp ?? ev?.closersvp),
            }))
            .filter((ev) => ["Open", "Closed", "Completed"].includes(ev.status));

          return { id: progId ?? progName, name: progName, progevent: activeProgevents };
        })
        .filter((p) => Array.isArray(p.progevent) && p.progevent.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name));

      setProgramsList(normalizedProgramsList);
      setEventsList(normalizedEventsList);
      setActivePrograms(normalizedActivePrograms);
    } catch (err) {
      console.error("Error fetching programs/events:", err);
      setError("Failed to load programs/events.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProgramsAndEvents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!progname || !eventname || !eventdate || !eventday || !rsvpClosedate) {
      setError("All fields are required."); return;
    }

    try {
      await addProgram({
        progname,
        progevent: [{ eventname, eventdate, eventday, eventstatus, closersvp: rsvpClosedate }]
      });

      setSuccess("✅ Program & Event activated successfully!");
      setProgname(""); setEventname(""); setEventdate(""); setEventday("");
      setEventstatus("Open"); setRsvpClosedate("");
      await fetchProgramsAndEvents();
    } catch (err) {
      console.error("Error activating event:", err);
      setError("❌ Failed to activate event.");
    }
  };

  const handleSaveStatus = async (programId, eventId) => {
    try {
      await updateEventStatus(programId, eventId, newStatus);
      setSuccess("✅ Event status updated!");
      setEditRow(null);
      await fetchProgramsAndEvents();
    } catch (err) {
      console.error("Error updating event status:", err);
      setError("❌ Failed to update status.");
    }
  };

  return (
    <div className="add-program-container">
      <h3>Manage Program & Event</h3>

      <form className="program-form" onSubmit={handleSubmit}>
        {/* Row 1
        <div className="form-row">
          <div className="form-group">
            <label>Select Program</label>
            <select value={progname} onChange={(e) => setProgname(e.target.value)} required>
              <option value="">-- Select Program --</option>
              {programsList.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Select Event</label>
            <select value={eventname} onChange={(e) => setEventname(e.target.value)} required>
              <option value="">-- Select Event --</option>
              {eventsList.map((ev) => <option key={ev.id} value={ev.name}>{ev.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Event Status</label>
            <select value={eventstatus} onChange={(e) => setEventstatus(e.target.value)} required>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              {/*<option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Row 2
        <div className="form-row">
          <div className="form-group">
            <label>Event Date</label>
            <input type="date" value={eventdate} onChange={(e) => setEventdate(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Event Day</label>
            <input type="text" value={eventday} readOnly />
          </div>

          <div className="form-group">
            <label>RSVP Close Date</label>
            <input type="date" value={rsvpClosedate} onChange={(e) => setRsvpClosedate(e.target.value)} required />
          </div>
        </div>

        {/* Row 3
        <div className="form-row" style={{ justifyContent: "center" }}>
          <button type="submit" className="btn-submit">Update Event</button>
        </div>
      </form>

      {/* Messages
      {error && <p className="form-message error">{error}</p>}
      {success && <p className="form-message success">{success}</p>}

      {/* Active Programs/Events table
      {activePrograms.length > 0 ? (
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
              {activePrograms.map((program) => {
                const evs = Array.isArray(program.progevent) ? program.progevent : [];
                return evs.map((ev, idx) => {
                  const rowKey = `${program.id}-${ev.id}`;
                  const isFirst = idx === 0;
                  return (
                    <tr key={rowKey}>
                      {isFirst && <td rowSpan={evs.length}>{program.name}</td>}
                      <td>{ev.name}</td>
                      <td>{ev.eventday}, {displayDate(ev.eventdate)}</td>
                      <td>{displayDate(ev.closersvp)}</td>
                      <td>
                        {editRow === rowKey ? (
                          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                            <option value="Completed">Completed</option>
                          </select>
                        ) : ev.status}
                      </td>
                      <td>
                        {editRow === rowKey ? (
                          <button className="btn-save" onClick={() => handleSaveStatus(program.id, ev.id)}>Save</button>
                        ) : (
                          <input type="checkbox" onChange={() => { setEditRow(rowKey); setNewStatus(ev.status); }} />
                        )}
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ fontStyle: "italic", color: "#666" }}>No active programs/events.</p>
      )}

      {activePrograms.length > 0 ? (
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
              {activePrograms.map((program) => {
                const evs = Array.isArray(program.progevent) ? program.progevent : [];
                return evs.map((ev, idx) => {
                  const rowKey = `${program.id}-${ev.id}`;
                  const isFirst = idx === 0;
                  return (
                    <tr key={rowKey}>
                      {isFirst && <td rowSpan={evs.length}>{program.name}</td>}
                      <td>{ev.name}</td>
                      <td>{ev.eventday}, {displayDate(ev.eventdate)}</td>
                      <td>{displayDate(ev.closersvp)}</td>
                      <td>
                        {editRow === rowKey ? (
                          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                            <option value="Completed">Completed</option>
                          </select>
                        ) : ev.status}
                      </td>
                      <td>
                        {editRow === rowKey ? (
                          <button className="btn-save" onClick={() => handleSaveStatus(program.id, ev.id)}>Save</button>
                        ) : (
                          <input type="checkbox" onChange={() => { setEditRow(rowKey); setNewStatus(ev.status); }} />
                        )}
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ fontStyle: "italic", color: "#666" }}>No active programs/events.</p>
      )}
    </div>
  );
}
*/