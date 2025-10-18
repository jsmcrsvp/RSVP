// frontend/src/components/AdminUpdateDatabase.js
import React, { useState } from "react";
import axios from "axios";
import "../styles/Admin.css"; // optional: reuse admin styles

export default function AdminUpdateDatabase() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please choose an Excel (.xlsx) file first.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const form = new FormData();
      form.append("excelFile", file);

      const res = await axios.post("/api/updateDatabase", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.success) {
        setMessage(`✅ ${res.data.message}`);
      } else {
        setMessage(`⚠️ ${res.data?.message || "Upload completed with warnings."}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("❌ Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Update Database</h3>
      <p>Select member list Excel file (.xlsx)</p>
      <input type="file" accept=".xlsx,.xls" onChange={onFileChange} />
      <div style={{ marginTop: 10 }}>
        <button onClick={handleUpload} disabled={loading} style={{ padding: "0.5rem 1rem" }}>
          {loading ? "Uploading..." : "Upload & Import"}
        </button>
      </div>
      {message && <div style={{ marginTop: 12 }}>{message}</div>}
    </div>
  );
}
