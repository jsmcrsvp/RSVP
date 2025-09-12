// frontend/src/components/Home.js
import React, { useEffect, useState } from "react";
import { getOpenEvents } from "../api";

export default function Home() {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState("");

    const displayDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        return `${month}/${day}/${year}`;
    };

    // Load open events once
    useEffect(() => {
        (async () => {
            setLoadingEvents(true);
            try {
                console.log("Loading open events...");
                const data = await getOpenEvents();
                setEvents(Array.isArray(data) ? data : []);
                console.log("Open events loaded:", Array.isArray(data) ? data.length : 0);
            } catch (err) {
                console.error("Failed to load open events:", err);
                setError("Failed to load open events.");
            } finally {
                setLoadingEvents(false);
            }
        })();
    }, []);

    return (
        <div className="home">
            <h4>Welcome to JSMC RSVP Portal</h4>

            {error && <div className="error-message">{error}</div>}

            <div className="result-table-wrapper" style={{ marginTop: "10px" }}>
                <h4>Current Open Events</h4>
                {Array.isArray(events) && events.length > 0 ? (
                    <table className="result-table" style={{ marginBottom: "20px" }}>
                        <thead>
                            <tr>
                                <th>Program</th>
                                <th>Event Name</th>
                                <th>Event Date</th>
                                <th>RSVP By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((ev, idx) => {
                                const isFirst =
                                    idx === 0 || ev.programname !== events[idx - 1].programname;
                                const programCount = events.filter(
                                    (e) => e.programname === ev.programname
                                ).length;
                                return (
                                    <tr key={ev._id || idx}>
                                        {isFirst && <td rowSpan={programCount}>{ev.programname}</td>}
                                        <td>{ev.eventname}</td>
                                        <td>{ev.eventday}, {displayDate(ev.eventdate)}</td>
                                        <td>{displayDate(ev.closersvp)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ fontStyle: "italic", color: "#666" }}>
                        No open events available at this time.
                    </p>
                )}
            </div>
        </div>
    );
}
