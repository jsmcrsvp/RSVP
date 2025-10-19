// frontend/src/components/AdminClearRsvp.js
import React, { useState, useEffect } from "react";
import { getCompletedEvents, clearRSVP } from "../api";
//import "../styles/SubmitRSVP.css";
import "../styles/Admin.css";

export default function AdminClearRsvp() {
    const [completedEvents, setCompletedEvents] = useState([]);
    const [selectedEvents, setSelectedEvents] = useState({});
    const [loadingEvents, setLoadingEvents] = useState({});
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Fetch completed events
    useEffect(() => {
        const fetchCompleted = async () => {
            setError("");
            try {
                const data = await getCompletedEvents();
                setCompletedEvents(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("❌ Error fetching completed events:", err);
                setError(err.message || "Failed to fetch completed events");
            }
        };
        fetchCompleted();
    }, []);

    const toggleSelect = (eventId) => {
        setSelectedEvents((prev) => ({
            ...prev,
            [eventId]: !prev[eventId],
        }));
    };

    const handleClearRsvp = async (ev) => {
        const eventId = ev._id;
        setLoadingEvents((prev) => ({ ...prev, [eventId]: true }));
        setMessage("");
        setError("");
        try {
            const data = await clearRSVP(ev.eventname);
            setMessage(`RSVP cleared for event '${ev.eventname}'`);

            // If backend confirms event deleted, remove row; else set totalRSVP to 0
            setCompletedEvents((prev) =>
                prev
                    .map((e) => (e._id === eventId ? { ...e, totalRSVP: 0 } : e))
                    .filter((e) => e._id !== eventId || !data.eventDeleted)
            );

            setSelectedEvents((prev) => {
                const updated = { ...prev };
                delete updated[eventId];
                return updated;
            });
        } catch (err) {
            console.error("❌ Error clearing RSVP:", err);
            setError(err.response?.data?.message || err.message || "Failed to clear RSVP");
        } finally {
            setLoadingEvents((prev) => ({ ...prev, [eventId]: false }));
        }
    };

    return (
        <div style={{ padding: "0.5rem" }}>
            <h3>Clear RSVP for Completed Events</h3>

            {error && <div className="error-message">{error}</div>}
            {message && <div style={{ color: "green", marginBottom: "1rem" }}>✅ {message}</div>}

            {completedEvents.length === 0 ? (
                <div style={{ textAlign: "center", color: "#888", fontStyle: "italic", marginTop: "10px" }}>
                    No completed events found.
                </div>
            ) : (
                <div className="result-table-wrapper">
                    <table className="result-table">
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>Program</th>
                                <th>Event Name</th>
                                <th>Event Date</th>
                                <th>Total RSVP</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedEvents.map((ev) => (
                                <tr key={ev._id}>
                                    <td style={{ textAlign: "center" }}>
                                        <input
                                            type="checkbox"
                                            checked={!!selectedEvents[ev._id]}
                                            onChange={() => toggleSelect(ev._id)}
                                        />
                                    </td>
                                    <td>{ev.programname}</td>
                                    <td>{ev.eventname}</td>
                                    <td>{ev.eventday}, {ev.eventdate}</td>
                                    <td style={{ textAlign: "center" }}>{ev.totalRSVP}</td>
                                    <td style={{ textAlign: "center" }}>
                                        {selectedEvents[ev._id] && (
                                            <button
                                                onClick={() => handleClearRsvp(ev)}
                                                disabled={!!loadingEvents[ev._id]}
                                            >
                                                {loadingEvents[ev._id] ? "Clearing..." : "Clear RSVP"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
