// frontend/src/components/AdminUpdateDatabase.js
import React, { useState } from "react";
import { uploadMemberExcel } from "../api";

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
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h3>Update Member Database</h3>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#4c6daf",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: uploading ? "not-allowed" : "pointer",
        }}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
