import React, { useState, useEffect } from "react";
import { getAdminAllPrograms, addAdminNewProgram } from "../api";

const AdminAddProgram = () => {
  const [programName, setProgramName] = useState("");
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch existing programs
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await getAdminAllPrograms();
        setPrograms(data);
      } catch (err) {
        console.error("❌ Error fetching programs:", err);
        setMessage("Failed to load existing programs");
      }
    };
    fetchPrograms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!programName.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const data = await addAdminNewProgram(programName.trim());
      setPrograms([data.program, ...programs]);
      setMessage(data.message || "Program added successfully");
      setProgramName("");
    } catch (err) {
      console.error("❌ Error adding program:", err);
      setMessage(err.response?.data?.error || "Failed to add program");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Admin: Add Program</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Program Name:</label>
          <input
            type="text"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
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
    </div>
  );
};

export default AdminAddProgram;
