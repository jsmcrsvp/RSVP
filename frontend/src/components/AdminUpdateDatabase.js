// frontend/src/components/AdminUpdateDatabase.js
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
    <div style={{ padding: "1rem" }}>
      <h3>Update Member Database</h3>
      <p>Select member list Excel file (.xlsx)</p>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading} style={{ padding: "0.5rem 1rem"}}>
        {uploading ? "Uploading..." : "Upload & Import"}
      </button>
      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}