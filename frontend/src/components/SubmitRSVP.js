import React, { useState, useEffect } from "react";
import { getOpenEvents, searchMember, submitRSVP } from "../api";
import "../styles/SubmitRSVP.css";

function SubmitRSVP() {
  const [openEvents, setOpenEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [searchMode, setSearchMode] = useState("memberId");
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [memberData, setMemberData] = useState(null);
  const [rsvpCount, setRsvpCount] = useState("");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load open events
  useEffect(() => {
    async function fetchOpenEvents() {
      try {
        const events = await getOpenEvents();
        setOpenEvents(events);
      } catch (err) {
        console.error("Error fetching open events:", err);
      }
    }
    fetchOpenEvents();
  }, []);

  const handleMemberSearch = async (e) => {
    e.preventDefault();
    setMessage("");
    setMemberData(null);

    try {
      setIsLoading(true);
      const payload =
        searchMode === "memberId"
          ? { memberId }
          : { name, houseNumber };

      const data = await searchMember(payload);
      setMemberData(data);

      // generate unique 6-digit confirmation number
      const confNumber = Math.floor(100000 + Math.random() * 900000);
      setConfirmationNumber(confNumber);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRSVPSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !memberData || !rsvpCount) {
      setMessage("Please select event, search member, and enter RSVP count.");
      return;
    }

    const payload = {
      programname: selectedEvent.programname,
      eventname: selectedEvent.eventname,
      eventdate: selectedEvent.eventdate,
      eventday: selectedEvent.eventday,
      memname: memberData.name,
      memaddress: memberData.address,
      memphonenumber: memberData.phone,
      rsvpcount: rsvpCount,
      rsvpconfnumber: confirmationNumber,
    };

    try {
      await submitRSVP(payload);
      setMessage(`✅ RSVP submitted! Confirmation #: ${confirmationNumber}`);
      // reset form
      setSelectedEvent("");
      setMemberId("");
      setName("");
      setHouseNumber("");
      setMemberData(null);
      setRsvpCount("");
      setConfirmationNumber("");
    } catch (err) {
      setMessage(err.message || "❌ Failed to submit RSVP");
    }
  };

  return (
    <div className="rsvp-container">
      <h2>RSVP Submission</h2>

      {message && <p className="message">{message}</p>}

      {/* Event Selection */}
      <div className="form-row">
        <label>Select Open Event:</label>
        <select
          value={selectedEvent ? JSON.stringify(selectedEvent) : ""}
          onChange={(e) => setSelectedEvent(JSON.parse(e.target.value))}
        >
          <option value="">-- Select Event --</option>
          {openEvents.map((event, idx) => (
            <option key={idx} value={JSON.stringify(event)}>
              {event.programname} - {event.eventname} ({event.eventdate})
            </option>
          ))}
        </select>
      </div>

      {/* Member Search */}
      {selectedEvent && (
        <form onSubmit={handleMemberSearch} className="search-member-form">
          <div className="form-row">
            <label>
              <input
                type="radio"
                value="memberId"
                checked={searchMode === "memberId"}
                onChange={() => setSearchMode("memberId")}
              />
              Member ID
            </label>
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

          <div className="form-row">
            <label>
              <input
                type="radio"
                value="nameHouse"
                checked={searchMode === "nameHouse"}
                onChange={() => setSearchMode("nameHouse")}
              />
              Name & House #
            </label>
            {searchMode === "nameHouse" && (
              <div className="inline-fields">
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
              </div>
            )}
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search Member"}
          </button>
        </form>
      )}

      {/* Member Details & RSVP */}
      {memberData && (
        <form onSubmit={handleRSVPSubmit} className="rsvp-form">
          <div className="form-row">
            <label>Name:</label>
            <input type="text" value={memberData.name} readOnly />
          </div>
          <div className="form-row">
            <label>Address:</label>
            <input type="text" value={memberData.address} readOnly />
          </div>
          <div className="form-row">
            <label>Phone:</label>
            <input type="text" value={memberData.phone} readOnly />
          </div>
          <div className="form-row">
            <label>RSVP Count:</label>
            <input
              type="number"
              value={rsvpCount}
              onChange={(e) => setRsvpCount(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label>Confirmation #:</label>
            <input type="text" value={confirmationNumber} readOnly />
          </div>
          <button type="submit">Submit RSVP</button>
        </form>
      )}
    </div>
  );
}

export default SubmitRSVP;
