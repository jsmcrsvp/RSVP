import React, { useEffect, useMemo, useState } from "react";
import { getOpenEvents, searchMember, submitRSVP } from "../api";
import "../styles/SubmitRSVP.css"; // keep the casing exactly the same as your file

export default function SubmitRSVP() {
  const [openEvents, setOpenEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [member, setMember] = useState(null);
  const [attendance, setAttendance] = useState("");
  const [guests, setGuests] = useState(0);
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const events = await getOpenEvents();
        setOpenEvents(events);
      } catch (err) {
        setError("Failed to load open events");
      }
    }
    fetchEvents();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setConfirmation(null);

    try {
      const res = await searchMember({ query: searchQuery });
      if (res && res.member) {
        setMember(res.member);
      } else {
        setMember(null);
        setError("Member not found.");
      }
    } catch (err) {
      setError("Error searching member.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !member || !attendance) {
      setError("Please complete all required fields.");
      return;
    }
    setError("");
    setMessage("");

    try {
      const payload = {
        eventId: selectedEvent,
        memberId: member._id,
        attendance,
        guests,
      };
      const res = await submitRSVP(payload);
      setMessage("RSVP submitted successfully!");
      setConfirmation(res); // ✅ store full response for confirmation table
      setAttendance("");
      setGuests(0);
    } catch (err) {
      setError(err.message || "Error submitting RSVP.");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="search-container">
        <h2>RSVP Submission</h2>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="message">{message}</div>}

        {!confirmation && (
          <>
            {/* Search Form */}
            <form className="search-form" onSubmit={handleSearch}>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Search member by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
                <button type="submit" className="button">
                  Search
                </button>
              </div>
            </form>

            {/* RSVP Form */}
            {member && (
              <form className="rsvp-form" onSubmit={handleSubmit}>
                <div className="form-section">
                  <label>Event:</label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    required
                  >
                    <option value="">Select Event</option>
                    {openEvents.map((event) => (
                      <option key={event._id} value={event._id}>
                        {event.title} – {event.date}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-section">
                  <label>Attendance:</label>
                  <div className="form-row">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="attendance"
                        value="Yes"
                        checked={attendance === "Yes"}
                        onChange={(e) => setAttendance(e.target.value)}
                      />
                      Yes
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="attendance"
                        value="No"
                        checked={attendance === "No"}
                        onChange={(e) => setAttendance(e.target.value)}
                      />
                      No
                    </label>
                  </div>
                </div>

                {attendance === "Yes" && (
                  <div className="form-section">
                    <label>Number of Guests:</label>
                    <input
                      type="number"
                      min="0"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                    />
                  </div>
                )}

                <button type="submit" className="button">
                  Submit RSVP
                </button>
              </form>
            )}
          </>
        )}

        {/* Confirmation Table */}
        {confirmation && (
          <div className="last-rsvp">
            <h3>RSVP Confirmation</h3>
            <table>
              <tbody>
                <tr>
                  <th>Confirmation #</th>
                  <td>{confirmation.confirmationNumber}</td>
                </tr>
                <tr>
                  <th>Member</th>
                  <td>{member?.name}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{member?.email}</td>
                </tr>
                <tr>
                  <th>Event</th>
                  <td>{openEvents.find(e => e._id === selectedEvent)?.title}</td>
                </tr>
                <tr>
                  <th>Date</th>
                  <td>{openEvents.find(e => e._id === selectedEvent)?.date}</td>
                </tr>
                <tr>
                  <th>Attendance</th>
                  <td>{confirmation.attendance}</td>
                </tr>
                {confirmation.attendance === "Yes" && (
                  <tr>
                    <th>Guests</th>
                    <td>{confirmation.guests}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}



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