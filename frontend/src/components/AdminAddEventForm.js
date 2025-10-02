import React, { useState, useEffect } from "react";
import { getAllEvents, addNewEvent } from "../api";
import "../styles/Admin.css";

const AdminAddEvent = () => {
    const [eventName, setEventName] = useState("");
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Helper: sort A-Z by event_name
    const sortEvents = (list) =>
        [...list].sort((a, b) =>
            a.event_name.localeCompare(b.event_name, undefined, { sensitivity: "base" })
        );

    // Fetch existing events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getAllEvents();
                setEvents(sortEvents(data));
            } catch (err) {
                console.error("❌ Error fetching events:", err);
                setMessage("Failed to load existing events");
            }
        };
        fetchEvents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!eventName.trim()) return;

        setLoading(true);
        setMessage("");

        try {
            const data = await addNewEvent(eventName.trim());
            setEvents(sortEvents([...events, data.event]));
            setMessage(data.message || "Event added successfully");
            setEventName("");
        } catch (err) {
            console.error("❌ Error adding event:", err);
            setMessage(err.response?.data?.error || "Failed to add event");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "1rem" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <span className="inline-label">Event Name:</span>
                <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Enter event name"
                    style={{ flex: "1", padding: "0.5rem" }}
                />
                <button type="submit" disabled={loading} style={{ padding: "0.5rem 1rem" }}>
                    {loading ? "Saving..." : "Save"}
                </button>
            </form>

            {message && <p>{message}</p>}

            <hr />
            <h3>Existing Events</h3>
            <div className="result-table-wrapper">
                <table className="result-table">
                    <thead>
                        <tr>
                            <th>Event Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(events) && events.length > 0 ? (
                            events.map((e) => (
                                <tr key={e._id || Math.random()}>
                                    <td>{e.event_name}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td style={{ textAlign: "center" }}>No events found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAddEvent;