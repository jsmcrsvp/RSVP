// frontend/src/components/SubmitRSVP/MemberRSVP.js
import React, { useState } from "react";
import { submitRSVP } from "../../api";

export default function MemberRSVP({ events, onHome }) {
  const [member, setMember] = useState(null);
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [searchMode, setSearchMode] = useState("");
  const [email, setEmail] = useState("");
  const [selectedEvents, setSelectedEvents] = useState({});
  const [rsvpCount, setRsvpCount] = useState(0);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasValidSelection = () => {
    return Object.values(selectedEvents).some((val) => Number(val) > 0);
  };

  const handleSubmitRSVP = async (e) => {
    e.preventDefault();
    setError("");
    setConfirmation(null);
    setSubmitMessage(null);

    if (!member) {
      setError("Please search and select a member first.");
      return;
    }
    if (!hasValidSelection()) {
      setError("Please select at least one event and give it an RSVP count (>0).");
      return;
    }
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    const confNumber = Math.floor(100000 + Math.random() * 900000).toString();

    const payload = {
      memname: member.name,
      memaddress: member.address,
      memphonenumber: member.phone,
      email: email.trim(),
      rsvpconfnumber: confNumber,
      events: events
        .map((ev, idx) =>
          selectedEvents[idx] && Number(selectedEvents[idx]) > 0
            ? {
                programname: ev.programname,
                eventname: ev.eventname,
                eventday: ev.eventday,
                eventdate: ev.eventdate,
                rsvpcount: rsvpCount,
              }
            : null
        )
        .filter(Boolean),
    };

    console.log("Submitting RSVP Payload:", payload);

    setSubmitting(true);
    try {
      const res = await submitRSVP(payload);
      console.log("Submit response:", res);
      setConfirmation({ confNumber, ...res });
      setSubmitMessage("RSVP submitted successfully!");
      setSubmitSuccess(true);

      setTimeout(() => {
        setSubmitMessage(null);
        setSubmitSuccess(false);
        setConfirmation(null);
        setMember(null);
        setSelectedEvents({});
        setEmail("");
        setSearchMode("");
        setMemberId("");
        setName("");
        setHouseNumber("");
        onHome(); // back to Home tab
      }, 15000);
    } catch (err) {
      console.error("Error submitting RSVP:", err);
      setSubmitMessage("Error submitting RSVP: " + (err.message || "Unknown"));
      setSubmitSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-section">
      <h3>Submit RSVP (Life Member)</h3>
      <form onSubmit={handleSubmitRSVP}>
        {/* Search by MemberId */}
        <div className="form-group">
          <label>Member ID</label>
          <input
            type="text"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            placeholder="Enter Member ID"
          />
        </div>

        {/* Search by Name + House */}
        <div className="form-group">
          <label>Member Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Name"
          />
        </div>
        <div className="form-group">
          <label>House Number</label>
          <input
            type="text"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
            placeholder="Enter House Number"
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email"
          />
        </div>

        {/* RSVP Events */}
        <h4>Select Events</h4>
        {events.map((ev, idx) => (
          <div key={idx} className="form-group">
            <label>
              {ev.programname} - {ev.eventname} ({ev.eventday}, {ev.eventdate})
            </label>
            <input
              type="number"
              min="0"
              value={selectedEvents[idx] || ""}
              onChange={(e) =>
                setSelectedEvents({
                  ...selectedEvents,
                  [idx]: e.target.value,
                })
              }
            />
          </div>
        ))}

        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit RSVP"}
        </button>
      </form>

      {error && <p className="form-message error">{error}</p>}
      {submitMessage && (
        <p
          className={`form-message ${submitSuccess ? "success" : "error"}`}
        >
          {submitMessage}
        </p>
      )}
    </div>
  );
}
