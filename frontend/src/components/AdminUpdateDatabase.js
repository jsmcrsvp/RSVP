// frontend/src/components/AdminDatabaseUpdate.js
import React, { useState } from "react";
import { uploadMemberExcel, deleteAllMembers } from "../api";

export default function AdminDatabaseUpdate() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState("");
    const [deleteMsg, setDeleteMsg] = useState("");
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setSuccess("");
        setDeleteMsg("");
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
            setError("");
            setSuccess("");
            setDeleteMsg("");

            // delete existing members
            const del = await deleteAllMembers();
            console.log("Delete response:", del);
            setDeleteMsg(del.message || "Existing members deleted successfully.");

            // upload file
            const formData = new FormData();
            formData.append("file", file);
            const res = await uploadMemberExcel(formData);
            console.log("Import response:", res);

            setSuccess(res.message || "Members updated successfully.");
        } catch (err) {
            console.error("Upload/import error:", err);
            setError(err.message || err.toString() || "Error during import.");
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
                    style={{ fontSize: "1rem", padding: "0.5rem", width: "100%", cursor: "pointer", }} />
            </div>

            <button
                onClick={handleUpload}
                disabled={uploading}
                style={{ padding: "0.6rem 1.2rem", fontSize: "1rem", cursor: "pointer", }}>
                {uploading ? "Processing..." : "Delete & Import"}</button>

            {deleteMsg && <p style={{ color: "blue" }}>{deleteMsg}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}