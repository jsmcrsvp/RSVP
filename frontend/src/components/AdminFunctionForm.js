// frontend/src/components/AdminFunctionForm.js
import React, { useState, useEffect } from "react";
import { getAdminPrograms, getAdminEvents } from "../api";

const AdminFunctionForm = () => {
  const [programName, setProgramName] = useState("");
  const [eventName, setEventName] = useState("");
  const [programs, setPrograms] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programs, events] = await Promise.all([
          getAdminPrograms(),
          getAdminEvents(),
        ]);
        setPrograms(programs);
        setEvents(events);
      } catch (error) {
        console.error("Error fetching existing programs/events:", error);
        setMessage("❌ Failed to load existing data.");
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/programs_events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program_name: programName,
          event_name: eventName,
        }),
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("❌ Invalid JSON response from server:", text);
        throw new Error("Server did not return valid JSON");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to save");
      }

      setMessage(data.message || "✅ Saved successfully!");

      if (programName) {
        setPrograms((prev) => [
          { program_name: programName, _id: Date.now() },
          ...prev,
        ]);
      }

      if (eventName) {
        setEvents((prev) => [
          { event_name: eventName, _id: Date.now() },
          ...prev,
        ]);
      }

      setProgramName("");
      setEventName("");
    } catch (err) {
      console.error("❌ Error adding Program & Event:", err);
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Admin: Add Program & Event</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Program Name:</label>
          <input
            type="text"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
          />
        </div>
        <div>
          <label>Event Name:</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
      </form>

      {message && <p>{message}</p>}

      <hr />

      <h3>Existing Programs</h3>
      <ul>
        {programs.map((p) => (
          <li key={p._id}>{p.program_name}</li>
        ))}
      </ul>

      <h3>Existing Events</h3>
      <ul>
        {events.map((e) => (
          <li key={e._id}>{e.event_name}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminFunctionForm;


/* frontend/src/components/AdminFunctionForm.js
import React, { useState, useEffect } from "react";
import { getAdminPrograms, getAdminEvents } from "../api";

const AdminFunctionForm = () => {
  const [programName, setProgramName] = useState("");
  const [eventName, setEventName] = useState("");
  const [programs, setPrograms] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch existing Programs & Events

useEffect(() => {
  const fetchData = async () => {
    try {
      const programs = await getAdminPrograms();
      const events = await getAdminEvents();
      setPrograms(programs);
      setEvents(events);
    } catch (error) {
      console.error("Error fetching existing programs/events:", error);
    }
  };

  fetchData();
}, []);

    // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/programs_events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program_name: programName,
          event_name: eventName,
        }),
      });

      const text = await res.text(); // <-- get raw text first
      let data;
      try {
        data = JSON.parse(text); // <-- try parsing JSON
      } catch (err) {
        console.error("❌ Invalid JSON response from server:", text);
        throw new Error("Server did not return valid JSON");
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to save");
      }

      setMessage(data.message || "Saved successfully!");

      // Refresh lists after saving
      if (programName) {
        setPrograms((prev) => [
          { program_name: programName, _id: Date.now() },
          ...prev,
        ]);
      }
      if (eventName) {
        setEvents((prev) => [
          { event_name: eventName, _id: Date.now() },
          ...prev,
        ]);
      }

      // Reset fields
      setProgramName("");
      setEventName("");
    } catch (err) {
      console.error("❌ Error adding Program & Event:", err);
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ padding: "1rem" }}>
      <h2>Admin: Add Program & Event</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Program Name:</label>
          <input
            type="text"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
          />
        </div>
        <div>
          <label>Event Name:</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
      </form>

      {message && <p>{message}</p>}

      <hr />

      <h3>Existing Programs</h3>
      <ul>
        {programs.map((p) => (
          <li key={p._id}>{p.program_name}</li>
        ))}
      </ul>

      <h3>Existing Events</h3>
      <ul>
        {events.map((e) => (
          <li key={e._id}>{e.event_name}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminFunctionForm;
*/