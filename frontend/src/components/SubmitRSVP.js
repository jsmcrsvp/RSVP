import React, { useState, useEffect } from "react";
import { getOpenEvents, searchMember, submitRSVP } from "../api";
import "../styles/SubmitRSVPForm.css";

function SubmitRSVP() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [searchMode, setSearchMode] = useState("memberId");
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [member, setMember] = useState(null);

  const [rsvpCount, setRsvpCount] = useState("");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [message, setMessage] = useState("");

  // Load open events on mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        const openEvents = await getOpenEvents();
        setEvents(openEvents);
      } catch (err) {
        console.error(err);
      }
    }
    fetchEvents();
  }, []);

  // Generate a 6-digit confirmation number
  const generateConfirmationNumber = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Member search
  const handleSearchMember = async (e) => {
    e.preventDefault();
    setMember(null);
    setMessage("");

    try {
      const payload =
        searchMode === "memberId"
          ? { memberId }
          : { name, houseNumber };
      const data = await searchMember(payload);
      setMember(data);
      setConfirmationNumber(generateConfirmationNumber());
    } catch (err) {
      setMessage(err.message || "Member not found");
    }
  };

  // Submit RSVP
  const handleSubmitRSVP = async (e) => {
    e.preventDefault();
    if (!member || !selectedEvent) return;

    const payload = {
      programname: selectedEvent.progname,
      eventname: selectedEvent.eventname,
      eventdate: selectedEvent.eventdate,
      eventday: selectedEvent.eventday,
      memname: member.name,
      memaddress: member.address,
      memphonenumber: member.phone,
      rsvpcount: rsvpCount,
      rsvpconfnumber: confirmationNumber,
    };

    try {
      await submitRSVP(payload);
      setMessage(`✅ RSVP submitted! Confirmation #: ${confirmationNumber}`);
      // Clear fields
      setMemberId("");
      setName("");
      setHouseNumber("");
      setMember(null);
      setRsvpCount("");
      setConfirmationNumber("");
    } catch (err) {
      setMessage(err.message || "❌ Failed to submit RSVP");
    }
  };

  return (
    <div className="rsvp-container">
      <h2>Submit RSVP</h2>

      {/* Step 1: Select Event */}
      <div className="search-section">
        <label>Select Open Event:</label>
        <select
          value={selectedEvent ? selectedEvent._id : ""}
          onChange={(e) =>
            setSelectedEvent(events.find((ev) => ev._id === e.target.value))
          }
        >
          <option value="">-- Select Event --</option>
          {events.map((ev) => (
            <option key={ev._id} value={ev._id}>
              {ev.progname} - {ev.eventname} ({ev.eventdate})
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: Search Member */}
      {selectedEvent && (
        <form onSubmit={handleSearchMember} className="search-section">
          <label>Search Member:</label>
          <div>
            <input
              type="radio"
              id="byId"
              name="searchMode"
              value="memberId"
              checked={searchMode === "memberId"}
              onChange={() => setSearchMode("memberId")}
            />
            <span>Member ID</span>
            {searchMode === "memberId" && (
              <input
                type="number"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="Enter Member ID"
                required
              />
            )}
          </div>
          <div>
            <input
              type="radio"
              id="byNameHouse"
              name="searchMode"
              value="nameHouse"
              checked={searchMode === "nameHouse"}
              onChange={() => setSearchMode("nameHouse")}
            />
            <span>Name & House #</span>
            {searchMode === "nameHouse" && (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  required
                />
                <span>House #</span>
                <input
                  type="text"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="House #"
                  required
                />
              </>
            )}
          </div>
          <button type="submit">Search Member</button>
        </form>
      )}

      {/* Step 3: RSVP Input */}
      {member && (
        <form onSubmit={handleSubmitRSVP} className="search-section">
          <div className="member-info">
            <p><strong>Member:</strong> {member.name}</p>
            <p><strong>Address:</strong> {member.address}</p>
            <p><strong>Phone:</strong> {member.phone}</p>
            <p><strong>Event:</strong> {selectedEvent.eventname}</p>
          </div>

          <label>RSVP Count:</label>
          <input
            type="number"
            value={rsvpCount}
            onChange={(e) => setRsvpCount(e.target.value)}
            min="1"
            required
          />

          <label>Confirmation Number:</label>
          <input type="text" value={confirmationNumber} readOnly />

          <button type="submit">Submit RSVP</button>
        </form>
      )}

      {/* Messages */}
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default SubmitRSVP;
