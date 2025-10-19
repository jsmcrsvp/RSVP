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

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await axios.post("/update-database", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(res.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      "⚠️ Are you sure you want to delete ALL members from the database?\nThis action cannot be undone."
    );
    if (!confirmed) return; // abort if user selects "No"

    try {
      const res = await axios.delete("/update-database/delete-all");
      setSuccess(res.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete members.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Update Member Database</h3>
      <p>Select member list Excel file (.xlsx)</p>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          style={{
            fontSize: "1rem",
            padding: "0.4rem",
            width: "100%",
            cursor: "pointer",
          }}
        />
      </div>

      <div>
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{ padding: "0.6rem 1.2rem", fontSize: "1rem", marginRight: "1rem" }}
        >
          {uploading ? "Uploading..." : "Upload & Import"}
        </button>

        <button
          onClick={handleDeleteAll}
          style={{
            padding: "0.6rem 1.2rem",
            fontSize: "1rem",
            backgroundColor: "#cc0000",
            color: "white",
            cursor: "pointer",
          }}
        >
          Delete All Members
        </button>
      </div>

      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AdminDatabaseUpdate;


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