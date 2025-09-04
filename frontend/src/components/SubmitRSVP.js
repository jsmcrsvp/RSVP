import React, { useState, useEffect } from "react";
import { getOpenEvents, searchMember, submitRSVP } from "../api";
import "./submitrsvp.css";

export default function SubmitRSVP() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [searchType, setSearchType] = useState("memID");
  const [searchValue, setSearchValue] = useState("");
  const [member, setMember] = useState(null);
  const [rsvpCount, setRsvpCount] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch open events on load
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getOpenEvents();
        setEvents(data || []);
      } catch (err) {
        setError("Failed to load open events.");
      }
    };
    fetchEvents();
  }, []);

  // Handle member search
  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setMember(null);

    try {
      const payload =
        searchType === "memID"
          ? { memID: searchValue }
          : { nameHouse: searchValue };

      const result = await searchMember(payload);
      if (result && result.length > 0) {
        setMember(result[0]);
      } else {
        setError("No member found.");
      }
    } catch (err) {
      setError("Error searching member.");
    }
  };

  // Handle RSVP submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !member) {
      setError("Please select an event and search for a member.");
      return;
    }

    try {
      const confNumber = Math.floor(100000 + Math.random() * 900000);

      const payload = {
        eventdate: selectedEvent.eventdate,
        eventday: selectedEvent.eventday,
        memname: member.memname,
        memaddress: member.memaddress,
        memphonenumber: member.memphonenumber,
        rsvpcount: rsvpCount,
        rsvpconfnumber: confNumber,
        eventname: selectedEvent.eventname,
        programname: selectedEvent.programname,
      };

      await submitRSVP(payload);
      setMessage(`RSVP submitted successfully! Confirmation #: ${confNumber}`);
      setMember(null);
      setSearchValue("");
      setRsvpCount(1);
    } catch (err) {
      setError("Error submitting RSVP.");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="rsvp-container">
        <h2>Submit RSVP</h2>

        {message && <div className="message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {/* Event selection */}
        <div className="form-section">
          <h3>Select Event</h3>
          <select
            value={selectedEvent ? selectedEvent.eventname : ""}
            onChange={(e) => {
              const event = events.find((ev) => ev.eventname === e.target.value);
              setSelectedEvent(event || "");
              setMember(null);
              setMessage("");
              setError("");
            }}
          >
            <option value="">-- Choose an Open Event --</option>
            {events.map((ev, idx) => (
              <option key={idx} value={ev.eventname}>
                {ev.programname} - {ev.eventname} ({ev.eventday}, {ev.eventdate})
              </option>
            ))}
          </select>
        </div>

        {/* Member Search */}
        <form className="search-form" onSubmit={handleSearch}>
          <h3>Search Member</h3>
          <div className="form-row">
            <label className="radio-label">
              <input
                type="radio"
                value="memID"
                checked={searchType === "memID"}
                onChange={() => setSearchType("memID")}
              />
              Member ID
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="nameHouse"
                checked={searchType === "nameHouse"}
                onChange={() => setSearchType("nameHouse")}
              />
              Name & House #
            </label>
          </div>

          <div className="inline-fields">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={
                searchType === "memID" ? "Enter Member ID" : "Enter Name & House #"
              }
              required
              className="small-input"
            />
            <button type="submit" className="button">
              Search
            </button>
          </div>
        </form>

        {/* Member + RSVP Form */}
        {member && (
          <form className="rsvp-form" onSubmit={handleSubmit}>
            <h3>Member Found</h3>
            <div className="result-table-wrapper">
              <table className="result-table">
                <tbody>
                  <tr>
                    <th>Name</th>
                    <td>{member.memname}</td>
                  </tr>
                  <tr>
                    <th>Address</th>
                    <td>{member.memaddress}</td>
                  </tr>
                  <tr>
                    <th>Phone</th>
                    <td>{member.memphonenumber}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="form-section">
              <label className="inline-label">RSVP Count:</label>
              <input
                type="number"
                min="1"
                value={rsvpCount}
                onChange={(e) => setRsvpCount(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="button">
              Submit RSVP
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
