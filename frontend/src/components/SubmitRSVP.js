// frontend/src/components/SubmitRSVP.js
import React, { useEffect, useMemo, useState } from "react";
import { getOpenEvents, searchMember, submitRSVP } from "../api";
import "../styles/SubmitRSVP.css"; // keep the casing exactly the same as your file

function SubmitRSVP() {
  const [openEvents, setOpenEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [memberId, setMemberId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberHouse, setMemberHouse] = useState("");
  const [member, setMember] = useState(null);
  const [rsvpCount, setRsvpCount] = useState("");
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  // Load open events on mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        const events = await getOpenEvents();
        setOpenEvents(events);
      } catch (err) {
        console.error("Failed to fetch open events:", err);
      }
    }
    fetchEvents();
  }, []);

  // Search member
  const handleSearch = async () => {
    setMember(null);
    setMessage("");
    try {
      const payload =
        memberId.trim() !== ""
          ? { memberId }
          : memberName && memberHouse
          ? { name: memberName, houseNumber: memberHouse }
          : null;
      if (!payload) {
        setMessage("Enter Member ID or Name + House Number");
        return;
      }
      const data = await searchMember(payload);
      setMember(data);
    } catch (err) {
      setMessage(err.message || "Member not found");
    }
  };

  // Submit RSVP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!selectedEvent || !member || !rsvpCount) {
      setMessage("Please select event, search member, and enter RSVP count");
      return;
    }

    const payload = {
      programname: selectedEvent.progname,
      eventname: selectedEvent.eventname,
      eventdate: selectedEvent.eventdate,
      eventday: selectedEvent.eventday,
      memname: member.name,
      memaddress: member.address,
      memphonenumber: member.phone,
      rsvpcount: rsvpCount
    };

    try {
      const response = await submitRSVP(payload);
      setConfirmation(response); // backend should return RSVP doc including generated confirmation number
      setMessage("✅ RSVP submitted successfully!");
      // Reset form fields except selected event
      setMemberId("");
      setMemberName("");
      setMemberHouse("");
      setMember(null);
      setRsvpCount("");
    } catch (err) {
      setMessage(err.message || "Failed to submit RSVP");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="rsvp-container">
        <h2>Submit RSVP</h2>
        {message && <p className="message">{message}</p>}

        {/* Event Selection */}
        <div className="form-section">
          <label>Select Open Event:</label>
          <select
            value={selectedEvent ? selectedEvent._id : ""}
            onChange={(e) =>
              setSelectedEvent(openEvents.find(ev => ev._id === e.target.value))
            }
          >
            <option value="">-- Select Event --</option>
            {openEvents.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.eventname} ({ev.progname}) - {ev.eventdate}
              </option>
            ))}
          </select>
        </div>

        {/* Member Search */}
        <div className="form-section search-form">
          <label>Search Member:</label>
          <div className="form-row">
            <input
              type="text"
              placeholder="Member ID"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            />
            <span>OR</span>
            <input
              type="text"
              placeholder="Name"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
            />
            <input
              type="text"
              placeholder="House #"
              value={memberHouse}
              onChange={(e) => setMemberHouse(e.target.value)}
            />
            <button type="button" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>

        {/* RSVP Count Input */}
        {member && (
          <div className="form-section">
            <p>
              Found Member: {member.name}, {member.address}, {member.phone}
            </p>
            <input
              type="number"
              min="1"
              placeholder="RSVP Count"
              value={rsvpCount}
              onChange={(e) => setRsvpCount(e.target.value)}
            />
            <button onClick={handleSubmit}>Submit RSVP</button>
          </div>
        )}

        {/* Confirmation Table */}
        {confirmation && (
          <div className="last-rsvp">
            <h3>RSVP Confirmation</h3>
            <table>
              <tbody>
                <tr>
                  <th>Confirmation #</th>
                  <td>{confirmation.rsvpconfnumber}</td>
                </tr>
                <tr>
                  <th>Member Name</th>
                  <td>{confirmation.memname}</td>
                </tr>
                <tr>
                  <th>Address</th>
                  <td>{confirmation.memaddress}</td>
                </tr>
                <tr>
                  <th>Phone</th>
                  <td>{confirmation.memphonenumber}</td>
                </tr>
                <tr>
                  <th>Program</th>
                  <td>{confirmation.programname}</td>
                </tr>
                <tr>
                  <th>Event</th>
                  <td>{confirmation.eventname}</td>
                </tr>
                <tr>
                  <th>Event Date</th>
                  <td>{confirmation.eventdate}</td>
                </tr>
                <tr>
                  <th>Event Day</th>
                  <td>{confirmation.eventday}</td>
                </tr>
                <tr>
                  <th>RSVP Count</th>
                  <td>{confirmation.rsvpcount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubmitRSVP;


/*import React, { useState, useEffect } from "react";
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
*/