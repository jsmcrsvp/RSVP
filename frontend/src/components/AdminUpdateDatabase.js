import React, { useState } from "react";
import axios from "axios";

const AdminDatabaseUpdate = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [log, setLog] = useState([]); // logs for progress messages

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setSuccess("");
        setError("");
        setLog([]);
    };

    const addLog = (msg) => {
        setLog((prev) => [...prev, msg]);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        const confirmDelete = window.confirm(
            "⚠️ This will delete ALL existing members before importing new ones.\nDo you want to continue?"
        );
        if (!confirmDelete) {
            setError("Import cancelled by user.");
            return;
        }

        try {
            setUploading(true);
            setLog([]);
            addLog("Deleting existing records...");

            // Step 1: Delete all existing members
            const deleteRes = await axios.delete("/update-database/delete-all");
            addLog(deleteRes.data.message || "Old records deleted successfully.");

            // Step 2: Import new members
            addLog("Importing new member records...");
            const formData = new FormData();
            formData.append("file", file);

            const res = await axios.post("/update-database", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            addLog(res.data.message || "New members imported successfully.");
            setSuccess("✅ Database update completed successfully!");
            setError("");
        } catch (err) {
            console.error("Upload & Import failed:", err);
            setError(err.response?.data?.message || "Error during import.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: "1rem" }}>
            <p>Select a new member list Excel (.xlsx) file to replace the database</p>

            <div style={{ marginBottom: "1rem" }}>
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    style={{
                        fontSize: "1rem",
                        padding: "0.5rem",
                        width: "100%",
                        cursor: "pointer",
                    }}
                />
            </div>

            <button
                onClick={handleUpload}
                disabled={uploading}
                style={{
                    padding: "0.6rem 1.2rem",
                    fontSize: "1rem",
                    cursor: "pointer",
                }}
            >
                {uploading ? "Processing..." : "Upload & Import"}
            </button>

            {success && <p style={{ color: "green" }}>{success}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Progress Log */}
            {log.length > 0 && (
                <div
                    style={{
                        marginTop: "1rem",
                        padding: "0.75rem",
                        backgroundColor: "#f4f4f4",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        fontSize: "0.9rem",
                    }}
                >
                    <b>Progress:</b>
                    <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
                        {log.map((msg, i) => (
                            <li key={i}>{msg}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AdminDatabaseUpdate;


/*
import React, { useState } from "react";
import axios from "axios";

const AdminDatabaseUpdate = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSuccess("");
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    const confirmDelete = window.confirm(
      "⚠️ This will delete ALL existing members before importing new ones.\nDo you want to continue?"
    );
    if (!confirmDelete) {
      setError("Import cancelled by user.");
      return;
    }

    try {
      setUploading(true);

      // Step 1: Delete all existing members
      await axios.delete("/update-database/delete-all");

      // Step 2: Import new members
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/update-database", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(res.data.message || "✅ Members updated successfully.");
      setError("");
    } catch (err) {
      console.error("Upload & Import failed:", err);
      setError(err.response?.data?.message || "Error during import.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <p>Select a new member list Excel (.xlsx) file to replace the database</p>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          style={{
            fontSize: "1rem",
            padding: "0.5rem",
            width: "100%",
            cursor: "pointer",
          }}
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          padding: "0.6rem 1.2rem",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        {uploading ? "Uploading..." : "Delete & Import"}
      </button>

      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AdminDatabaseUpdate;
*/

/* frontend/src/components/AdminUpdateDatabase.js
import React, { useState } from "react";
import { uploadMemberExcel } from "../api";
import "../styles/Admin.css";

export default function AdminUpdateDatabase() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setSuccess("");
        setError("");
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select an Excel file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);
            setError("");
            setSuccess("");

            const response = await uploadMemberExcel(formData);
            if (response.success) {
                setSuccess(response.message || "Members uploaded successfully!");
            } else {
                setError(response.message || "Upload failed.");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError("❌ Failed to upload the Excel file.");
        } finally {
            setUploading(false);
            setFile(null);
        }
    };

    return (
        <div style={{ padding: "0.5rem" }}>
            <p>Select a member list Excel (.xlsx) file to update database</p>
            <div style={{ marginBottom: "1rem" }}>
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    style={{ fontSize: "1rem", padding: "0.4rem", width: "100%" }}
                />
            </div>

            <div>
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    style={{
                        padding: "0.6rem 1.2rem",
                        fontSize: "1rem",
                        cursor: "pointer",
                    }}
                >
                    {uploading ? "Uploading..." : "Upload & Import"}
                </button>
            </div>
            {success && <p style={{ color: "green" }}>{success}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}
*/