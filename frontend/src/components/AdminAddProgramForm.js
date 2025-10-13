// frontend/src/components/AdminAddProgramForm.js
import React, { useState, useEffect } from "react";
import { getAdminAllPrograms, addAdminNewProgram } from "../api";
import "../styles/Admin.css";

const AdminAddProgram = () => {
    const [programName, setProgramName] = useState("");
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Helper: sort A-Z by program_name
    const sortPrograms = (list) =>
        [...list].sort((a, b) =>
            a.program_name.localeCompare(b.program_name, undefined, { sensitivity: "base" })
        );

    // Fetch existing programs
    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const data = await getAdminAllPrograms();
                setPrograms(sortPrograms(data));
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
            setPrograms(sortPrograms([...programs, data.program]));
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
            <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <span className="inline-label">Program Name:</span>
                <input
                    type="text"
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    placeholder="Enter program name"
                    style={{ flex: "1", padding: "0.5rem" }}
                />
                <button type="submit" disabled={loading} style={{ padding: "0.5rem 1rem" }}>
                    {loading ? "Saving..." : "Save"}
                </button>
            </form>

            {message && <p>{message}</p>}

            <hr />
            <h3>Existing Programs</h3>
            <div className="result-table-wrapper">
                <table className="result-table">
                    <thead>
                        <tr>
                            <th>Program Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(programs) && programs.length > 0 ? (
                            programs.map((p) => (
                                <tr key={p._id || Math.random()}>
                                    <td>{p.program_name}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td style={{ textAlign: "center" }}>No programs found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAddProgram;
