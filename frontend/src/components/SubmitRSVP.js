// frontend/src/components/SubmitRSVP.js ======= Working 090425 - 10:00am =======
import React, { useEffect, useMemo, useState } from "react";
import { getOpenEvents, searchMember, submitRSVP } from "../api";
import "../styles/SubmitRSVP.css"; // keep the casing exactly the same as your file

export default function SubmitRSVP() {
  // Events
  const [events, setEvents] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1); // index into events[]

  // Search state
  const [searchMode, setSearchMode] = useState("memberId"); // "memberId" | "nameHouse"
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");

  // Results & RSVP
  const [member, setMember] = useState(null); // { memberId, name, address, phone }
  const [rsvpCount, setRsvpCount] = useState(1);
  const [confNumber, setConfNumber] = useState("");

  // UI state
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Derived selected event
  const selectedEvent = useMemo(
    () => (selectedIndex >= 0 ? events[selectedIndex] : null),
    [events, selectedIndex]
  );

  // Load open events on mount
  useEffect(() => {
    (async () => {
      setLoadingEvents(true);
      setError("");
      try {
        const data = await getOpenEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch {
        setError("Failed to load open events.");
      } finally {
        setLoadingEvents(false);
      }
    })();
  }, []);

  // Generate a 6-digit confirmation number whenever both event & member are present
  useEffect(() => {
    if (selectedEvent && member) {
      const conf = Math.floor(100000 + Math.random() * 900000).toString();
      setConfNumber(conf);
    } else {
      setConfNumber("");
    }
  }, [selectedEvent, member]);

  // Member search handler
  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setMember(null);

    // Validate inputs
    if (searchMode === "memberId" && !memberId.trim()) {
      setError("Member ID is required.");
      return;
    }
    if (searchMode === "nameHouse" && (!name.trim() || !houseNumber.trim())) {
      setError("Name and House # are required.");
      return;
    }

    setSearching(true);
    try {
      const payload =
        searchMode === "memberId"
          ? { memberId: memberId.trim() }
          : { name: name.trim(), houseNumber: houseNumber.trim() };

      const result = await searchMember(payload); // expected: { memberId, name, address, phone }
      if (result && result.name) {
        setMember(result);
      } else {
        setError("Member not found.");
      }
    } catch (err) {
      setError(err.message || "Error searching member.");
    } finally {
      setSearching(false);
    }
  };

  // RSVP submit handler
  const handleSubmitRSVP = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!selectedEvent) {
      setError("Please select an event.");
      return;
    }
    if (!member) {
      setError("Please search and select a member first.");
      return;
    }
    if (!confNumber) {
      setError("Could not generate confirmation number. Try searching again.");
      return;
    }

    const payload = {
      eventdate: selectedEvent.eventdate,
      eventday: selectedEvent.eventday,
      memname: member.name,
      memaddress: member.address,
      memphonenumber: member.phone,
      rsvpcount: Number(rsvpCount) || 1,
      rsvpconfnumber: confNumber,
      eventname: selectedEvent.eventname,
      programname: selectedEvent.programname,
    };

    setSubmitting(true);
    try {
      await submitRSVP(payload);
      setMessage(`RSVP submitted! Confirmation #: ${confNumber}`);
      // Reset only RSVP-related fields; keep event selection
      setMember(null);
      setMemberId("");
      setName("");
      setHouseNumber("");
      setRsvpCount(1);
      // confNumber will be cleared by effect since member becomes null
    } catch (err) {
      setError(err.message || "Error submitting RSVP.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="rsvp-container">
        <h2>Welcome to JSMC RSVP Portal</h2>

        {message && <div className="message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {/* Event selection */}
        <div className="form-section">
          <h3>Select an available event to RSVP</h3>
          <select
            value={selectedIndex}
            onChange={(e) => {
              setSelectedIndex(Number(e.target.value));
              setMember(null);
              setMessage("");
              setError("");
            }}
            disabled={loadingEvents}
          >
            <option value={-1} disabled>
              {loadingEvents ? "Loading available events..." : "Select an Event"}
            </option>
            {events.map((ev, idx) => (
              <option key={`${ev.programname}-${ev.eventname}-${idx}`} value={idx}>
                {ev.programname} — {ev.eventname} ({ev.eventday}, {ev.eventdate})
              </option>
            ))}
          </select>
        </div>

        {/* Member search */}
        <form className="search-form" onSubmit={handleSearch}>
          <h4>Retrieve membership by entering Member ID or First Name & House Number</h4>

          <div className="form-row">
            <label className="radio-label">
              <input
                type="radio"
                value="memberId"
                checked={searchMode === "memberId"}
                onChange={() => setSearchMode("memberId")}
              />
              Member ID
            </label>

            <label className="radio-label">
              <input
                type="radio"
                value="nameHouse"
                checked={searchMode === "nameHouse"}
                onChange={() => setSearchMode("nameHouse")}
              />
              First Name &amp; House #
            </label>
          </div>

          {searchMode === "memberId" ? (
            <div className="inline-fields">
              <input
                className="small-input"
                type="number"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="Enter Member ID"
                required
              />
              <button className="button" type="submit" disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </button>
            </div>
          ) : (
            <div className="inline-fields">
              <input
                className="small-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
              />
              <span className="inline-label">House #</span>
              <input
                className="small-input"
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="e.g. 123"
                required
              />
              <button className="button" type="submit" disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </button>
            </div>
          )}
        </form>

        {/* Member result + RSVP */}
        {member && (
          <form className="rsvp-form" onSubmit={handleSubmitRSVP}>
            <h4>Membership Details</h4>

            <div className="result-table-wrapper">
              <table className="result-table">
                <tbody>
                  <tr>
                    <th>Name</th>
                    <td className="nowrap">{member.name}</td>
                  </tr>
                  <tr>
                    <th>Address</th>
                    <td>{member.address}</td>
                  </tr>
                  <tr>
                    <th>Phone</th>
                    <td className="nowrap">{member.phone}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="form-row" style={{ marginTop: "0.75rem" }}>
              <label className="inline-label">RSVP Count</label>
              <input
                className="small-input"
                type="number"
                min="1"
                value={rsvpCount}
                onChange={(e) => setRsvpCount(e.target.value)}
                required
              />

              <label className="inline-label">Conf #</label>
              <input
                className="small-input"
                type="text"
                value={confNumber}
                readOnly
                title="Auto-generated confirmation #"
              />
            </div>
              
            <button className="button" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit RSVP"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

{/* frontend/src/components/SubmitRSVP.js ======= Working 090425 - 10:00am =======*/}

{/*import React, { useState, useEffect } from "react";
import { searchMember, getOpenEvents, submitRSVP } from "../api";
import "../styles/SubmitRSVP.css";

function SubmitRSVP() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchMode, setSearchMode] = useState("memberId");
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [member, setMember] = useState(null);
  const [rsvpCount, setRsvpCount] = useState("");
  const [confNumber, setConfNumber] = useState("");
  const [message, setMessage] = useState("");
  const [lastRSVP, setLastRSVP] = useState(null); // store last submitted RSVP

  useEffect(() => {
    async function fetchEvents() {
      const openEvents = await getOpenEvents();
      setEvents(openEvents);
    }
    fetchEvents();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage("");
    setMember(null);
    try {
      const payload =
        searchMode === "memberId"
          ? { memberId }
          : { name, houseNumber };
      const data = await searchMember(payload);
      setMember(data);
    } catch (err) {
      setMessage(err.message || "Member not found");
    }
  };

  const handleRSVP = async (e) => {
    e.preventDefault();
    setMessage("");
    const conf = Math.floor(100000 + Math.random() * 900000).toString();
    setConfNumber(conf);

    const payload = {
      eventdate: selectedEvent.eventdate,
      eventday: selectedEvent.eventday,
      programname: selectedEvent.programname,
      eventname: selectedEvent.eventname,
      memname: member.name,
      memaddress: member.address,
      memphonenumber: member.phone,
      rsvpcount: rsvpCount,
      rsvpconfnumber: conf,
    };

    try {
      await submitRSVP(payload);
      setMessage(`✅ RSVP submitted! Confirmation #: ${conf}`);
      setLastRSVP(payload); // save last RSVP to display

      // Reset search and RSVP fields
      setMember(null);
      setMemberId("");
      setName("");
      setHouseNumber("");
      setRsvpCount("");
      setSelectedEvent(null);
    } catch (err) {
      setMessage(err.message || "❌ Failed to submit RSVP");
    }
  };

  return (
    <div className="rsvp-container">
      <h2>Submit RSVP</h2>
      {message && <p className="message">{message}</p>}

      <div className="form-section">
        <label>Open Event:</label>
        <select
          value={selectedEvent ? selectedEvent.eventname : ""}
          onChange={(e) =>
            setSelectedEvent(events.find((ev) => ev.eventname === e.target.value))
          }
        >
          <option value="">-- Select Event --</option>
          {events.map((ev, idx) => (
            <option key={idx} value={ev.eventname}>
              {ev.programname} - {ev.eventname} ({ev.eventdate})
            </option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <>
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-row">
              <label className="radio-label">
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
              <label className="radio-label">
                <input
                  type="radio"
                  value="nameHouse"
                  checked={searchMode === "nameHouse"}
                  onChange={() => setSearchMode("nameHouse")}
                />
                Name
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
                  <label> & House # </label>
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
            <button type="submit">Search Member</button>
          </form>
        </>
      )}

      {member && (
        <form onSubmit={handleRSVP} className="rsvp-form">
          <p>
            Member: {member.name}, {member.address}, {member.phone}
          </p>
          <input
            type="number"
            value={rsvpCount}
            onChange={(e) => setRsvpCount(e.target.value)}
            placeholder="RSVP Count"
            required
          />
          <button type="submit">Submit RSVP</button>
        </form>
      )}

      {/* Last submitted RSVP table }
      {lastRSVP && (
        <div className="last-rsvp">
          <h3>Last Submitted RSVP</h3>
          <table>
            <tbody>
              <tr>
                <th>Program</th>
                <td>{lastRSVP.programname}</td>
              </tr>
              <tr>
                <th>Event</th>
                <td>{lastRSVP.eventname}</td>
              </tr>
              <tr>
                <th>Date</th>
                <td>{lastRSVP.eventdate}</td>
              </tr>
              <tr>
                <th>Day</th>
                <td>{lastRSVP.eventday}</td>
              </tr>
              <tr>
                <th>Member Name</th>
                <td>{lastRSVP.memname}</td>
              </tr>
              <tr>
                <th>Address</th>
                <td>{lastRSVP.memaddress}</td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>{lastRSVP.memphonenumber}</td>
              </tr>
              <tr>
                <th>RSVP Count</th>
                <td>{lastRSVP.rsvpcount}</td>
              </tr>
              <tr>
                <th>Confirmation #</th>
                <td>{lastRSVP.rsvpconfnumber}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SubmitRSVP;
*/}