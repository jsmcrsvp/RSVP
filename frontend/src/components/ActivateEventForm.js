import React, { useState, useEffect } from "react";
import {
  getAllPrograms,
  getAdminAllPrograms,
  getAllEvents,
  addProgram,
  updateEventStatus,
} from "../api";
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
      <h3>Activate Program & Event</h3>

      <form className="program-form" onSubmit={handleSubmit}>

        {/* Row 1 */}
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
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Row 2 */}
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

        {/* Row 3 */}
        <div className="form-row" style={{ justifyContent: "center" }}>
          <button type="submit" className="btn-submit">Activate Event</button>
        </div>
      </form>

      {/* Messages */}
      {error && <p className="form-message error">{error}</p>}
      {success && <p className="form-message success">{success}</p>}

      {/* Active Programs/Events table */}
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



{/* frontend/src/components/ActivateEventForm.js
import React, { useState, useEffect } from "react";
import {
  getAllPrograms,       // programs collection (has progevent with eventstatus)
  getAdminAllPrograms,  // program_list for dropdown (simple names)
  getAllEvents,         // event_list for dropdown (simple names)
  addProgram,
  updateEventStatus,
} from "../api";
import "../styles/ActivateEventForm.css";

// Utility to format YYYY-MM-DD → MM/DD/YYYY
const displayDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
};

// Safely coerce a value to a trimmed string
const safeString = (v) => {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  try {
    return String(v).trim();
  } catch {
    return "";
  }
};

// Try many common keys to extract program / event names
const extractProgramName = (p) =>
  safeString(p?.program_name ?? p?.progname ?? p?.progName ?? p?.name ?? p?.program ?? p);
const extractEventName = (e) =>
  safeString(e?.event_name ?? e?.eventname ?? e?.evname ?? e?.name ?? e?.event ?? e);

// Try to extract stable id; fallback to name when id missing
const extractId = (obj, fallback) => obj?._id ?? obj?.id ?? fallback ?? null;

export default function ActivateEventForm() {
  // form fields
  const [progname, setProgname] = useState("");
  const [eventname, setEventname] = useState("");
  const [eventdate, setEventdate] = useState("");
  const [eventday, setEventday] = useState("");
  const [eventstatus, setEventstatus] = useState("Open");
  const [rsvpClosedate, setRsvpClosedate] = useState("");

  // dropdown lists
  const [programsList, setProgramsList] = useState([]); // { id, name }
  const [eventsList, setEventsList] = useState([]);     // { id, name }

  // active table data (from programs collection; each program has progevent array)
  const [activePrograms, setActivePrograms] = useState([]); // normalized { id, name, progevent: [{id,name,eventdate,eventday,status,closersvp}] }

  // misc
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // editing state
  const [editRow, setEditRow] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // update eventDay when eventdate changes
  useEffect(() => {
    if (eventdate) {
      const d = new Date(eventdate + "T00:00:00Z");
      const day = d.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
      setEventday(day);
    } else {
      setEventday("");
    }
  }, [eventdate]);

  // fetch & normalize dropdowns and programs collection
  const fetchProgramsAndEvents = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // fetch three sources:
      // - program_list (simple names for dropdown)
      // - event_list (simple names for dropdown)
      // - programs collection (has progevent with eventstatus) -> used for table
      const [rawProgramList, rawEventList, rawProgramsCollection] = await Promise.all([
        // these functions come from your api.js — they may reject; we catch below
        (async () => { try { return await getAdminAllPrograms(); } catch (e) { console.warn("getAdminAllPrograms failed", e); return null; } })(),
        (async () => { try { return await getAllEvents(); } catch (e) { console.warn("getAllEvents failed", e); return null; } })(),
        (async () => { try { return await getAllPrograms(); } catch (e) { console.warn("getAllPrograms (programs collection) failed", e); return null; } })(),
      ]);

      // normalize program dropdown
      const normalizedProgramsList = (Array.isArray(rawProgramList) ? rawProgramList : [])
        .map((p) => {
          const name = extractProgramName(p);
          const id = extractId(p, name);
          return { id: id ?? name, name };
        })
        .filter((p) => p.name) // only keep non-empty names
        .sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { sensitivity: "base" }));
      setProgramsList(normalizedProgramsList);

      // normalize events dropdown
      const normalizedEventsList = (Array.isArray(rawEventList) ? rawEventList : [])
        .map((e) => {
          const name = extractEventName(e);
          const id = extractId(e, name);
          return { id: id ?? name, name };
        })
        .filter((e) => e.name)
        .sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { sensitivity: "base" }));
      setEventsList(normalizedEventsList);

      // normalize programs collection for table:
      // only include progevent items whose status is Open | Closed | Completed
      const normalizedActivePrograms = (Array.isArray(rawProgramsCollection) ? rawProgramsCollection : [])
        .map((p) => {
          const progName = extractProgramName(p);
          const progId = extractId(p, progName);

          const rawProgevents = Array.isArray(p?.progevent) ? p.progevent : [];

          const normalizedProgevents = rawProgevents
            .map((ev) => {
              const evName = extractEventName(ev);
              const evId = extractId(ev, evName);
              const status = safeString(ev?.eventstatus ?? ev?.status ?? ev?.event_status);
              return {
                id: evId ?? evName,
                name: evName,
                eventdate: safeString(ev?.eventdate ?? ev?.date),
                eventday: safeString(ev?.eventday ?? ev?.day),
                status,
                closersvp: safeString(ev?.closersvp ?? ev?.closersvp),
              };
            })
            .filter((ev) => ev.name); // must have a name

          // keep only those progevent that have status in the allowed set
          const activeProgevents = normalizedProgevents.filter((ev) =>
            ["Open", "Closed", "Completed"].includes(ev.status)
          );

          return { id: progId ?? progName, name: progName, progevent: activeProgevents };
        })
        .filter((p) => Array.isArray(p.progevent) && p.progevent.length > 0);

      // Optionally sort the activePrograms by program name
      normalizedActivePrograms.sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { sensitivity: "base" }));

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

  // handle submit (activate event under program)
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
      setSuccess("✅ Program & Event activated successfully!");
      // reset form
      setProgname("");
      setEventname("");
      setEventdate("");
      setEventday("");
      setEventstatus("Open");
      setRsvpClosedate("");
      // refresh lists and table
      await fetchProgramsAndEvents();
    } catch (err) {
      console.error("Error activating event:", err);
      setError("❌ Failed to activate event.");
    }
  };

  // Save status change for an event
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
      <h3>Activate Program & Event</h3>

      <form className="program-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Program</label>
          <select value={progname} onChange={(e) => setProgname(e.target.value)} required>
            <option value="">-- Select Program --</option>
            {programsList.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Select Event</label>
          <select value={eventname} onChange={(e) => setEventname(e.target.value)} required>
            <option value="">-- Select Event --</option>
            {eventsList.map((ev) => (
              <option key={ev.id} value={ev.name}>{ev.name}</option>
            ))}
          </select>
        </div>

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

        <div className="form-group">
          <label>Event Status</label>
          <select value={eventstatus} onChange={(e) => setEventstatus(e.target.value)} required>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <button type="submit" className="btn-submit">Activate Event</button>
      </form>

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
                        ) : (
                          ev.status
                        )}
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
*/}



{/*/ frontend/src/components/ActivateEventForm.js ============ Working 091625 ==========12:30pm ===========
import React, { useState, useEffect } from "react";
import { getAllEvents, addNewEvent, getAdminAllPrograms, addProgram, updateEventStatus } from "../api";
import "../styles/ActivateEventForm.css";

// Utility to format YYYY-MM-DD → MM/DD/YYYY
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

  const [programs, setPrograms] = useState([]);
  const [events, setEvents] = useState([]);
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
      const day = date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
      setEventday(day);
    } else {
      setEventday("");
    }
  }, [eventdate]);

  // Fetch programs and events independently
  const fetchProgramsAndEvents = async () => {
    try {
      setLoading(true);
      const [programData, eventData] = await Promise.all([
        getAdminAllPrograms(),
        getAllEvents()
      ]);
      setPrograms(programData || []);
      setEvents(eventData || []);
    } catch (err) {
      console.error("Error fetching programs/events:", err);
      setError("Failed to load programs or events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramsAndEvents();
  }, []);

  // Handle form submission (activate program & event)
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

      await addProgram(payload); // Add to program collection
      setSuccess("✅ Program & Event added successfully!");
      setProgname("");
      setEventname("");
      setEventdate("");
      setEventday("");
      setEventstatus("Open");
      setRsvpClosedate("");
      fetchProgramsAndEvents();
    } catch (err) {
      console.error("Error activating event:", err);
      setError("❌ Failed to activate program & event.");
    }
  };

  // Save status change for events
  const handleSaveStatus = async (eventId) => {
    try {
      await updateEventStatus(null, eventId, newStatus); // progId not needed for independent events
      setSuccess("✅ Event status updated!");
      setEditRow(null);
      fetchProgramsAndEvents();
    } catch (err) {
      console.error("Error updating event status:", err);
      setError("❌ Failed to update status.");
    }
  };

  return (
    <div className="add-program-container">
      <h3>Activate Program & Event</h3>

      {/* Program & Event Form
      <form className="program-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Program</label>
<select
  value={progname}
  onChange={(e) => setProgname(e.target.value)}
  required
>
  <option value="">-- Select Program --</option>
  {programs
    .slice() // create a copy so original state isn’t mutated
    .sort((a, b) => a.program_name.localeCompare(b.program_name))
    .map((p) => (
      <option key={p._id} value={p.program_name}>
        {p.program_name}
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
  {events
    .slice()
    .sort((a, b) => a.event_name.localeCompare(b.event_name))
    .map((ev) => (
      <option key={ev._id} value={ev.event_name}>
        {ev.event_name}
      </option>
    ))}
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

        <button type="submit" className="btn-submit">
          Add Program & Event
        </button>
      </form>

      {/* Status messages
      {error && <p className="form-message error">{error}</p>}
      {success && <p className="form-message success">{success}</p>}

      {/* Events Table
      {events.length > 0 && (
        <div className="table-wrapper">
          <h3>Active Events</h3>
          <table className="programs-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Event Date</th>
                <th>RSVP By</th>
                <th>Status</th>
                <th>Modify</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const rowKey = event._id;
                return (
                  <tr key={rowKey}>
                    <td>{event.event_name}</td>
                    <td>{displayDate(event.eventdate)}</td>
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
                        <button
                          className="btn-save"
                          onClick={() => handleSaveStatus(event._id)}
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
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActivateEventForm;
*/}

{/* frontend/src/components/ActivateEventForm.js ============ Working 091625 =====12:00pm
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
      
      {/* Status messages
      {error && <p className="form-message error">{error}</p>}
      {success && <p className="form-message success">{success}</p>}

      {/* Programs & Events Table
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
*/}


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