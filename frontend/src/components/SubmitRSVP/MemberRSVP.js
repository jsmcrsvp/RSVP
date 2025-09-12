// frontend/src/components/SubmitRSVP/MemberRSVP.js
import React, { useState } from "react";
import { submitRSVP } from "../../api";

export default function MemberRSVP({ events, onHome }) {

    const [isLifeMember, setIsLifeMember] = useState(null);

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
            mememail: email.trim(),
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
        <div className="page-wrapper">
            <div className="rsvp-container">
                {isLifeMember === null && (
                    <div className="form-section">
                        <h3>Are you JSMC Life Member?</h3>
                        <label>
                            <input type="radio" name="lifeMember" value="yes" onChange={() => setIsLifeMember("yes")} /> Yes
                        </label>
                        <label style={{ marginLeft: "1rem" }}>
                            <input type="radio" name="lifeMember" value="no" onChange={() => setIsLifeMember("no")} /> No
                        </label>
                    </div>
                )}

                {isLifeMember === "yes" && !member && (
                    <form className="search-form" onSubmit={handleSearch}>
                        <h4>Retrieve membership using</h4>

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
                            <label style={{ marginLeft: "1rem" }}> OR </label>
                            <label style={{ marginLeft: "1rem" }}>
                                <input
                                    type="radio"
                                    value="nameHouse"
                                    checked={searchMode === "nameHouse"}
                                    onChange={() => setSearchMode("nameHouse")}
                                />
                                First Name &amp; House #
                            </label>
                        </div>

                        {/* ---- Member ID Search ---- */}
                        {searchMode === "memberId" && (
                            <div className="inline-fields">
                                <input
                                    className="small-input"
                                    type="number"
                                    value={memberId}
                                    onChange={(e) => setMemberId(e.target.value)}
                                    placeholder="Enter Member ID"
                                />
                                <button
                                    className="button"
                                    type="submit"
                                    disabled={searching || memberId.trim() === ""}
                                    style={{
                                        backgroundColor:
                                            searching || memberId.trim() === "" ? "lightgray" : "#007bff",
                                        color: searching || memberId.trim() === "" ? "#666" : "white",
                                        cursor:
                                            searching || memberId.trim() === "" ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {searching ? "Searching..." : "Search"}
                                </button>
                            </div>
                        )}

                        {/* ---- Name + House Search ---- */}
                        {searchMode === "nameHouse" && (
                            <div className="inline-fields">
                                <input
                                    className="small-input"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="First Name"
                                />
                                <span className="inline-label">House #</span>
                                <input
                                    className="small-input"
                                    type="text"
                                    value={houseNumber}
                                    onChange={(e) => setHouseNumber(e.target.value)}
                                    placeholder="e.g. 123"
                                />
                                <button
                                    className="button"
                                    type="submit"
                                    disabled={
                                        searching || name.trim() === "" || houseNumber.trim() === ""
                                    }
                                    style={{
                                        backgroundColor:
                                            searching || name.trim() === "" || houseNumber.trim() === ""
                                                ? "lightgray"
                                                : "#007bff",
                                        color:
                                            searching || name.trim() === "" || houseNumber.trim() === ""
                                                ? "#666"
                                                : "white",
                                        cursor:
                                            searching || name.trim() === "" || houseNumber.trim() === ""
                                                ? "not-allowed"
                                                : "pointer",
                                    }}
                                >
                                    {searching ? "Searching..." : "Search"}
                                </button>
                            </div>
                        )}
                    </form>
                )}

                {member && (
                    <form className="rsvp-form" onSubmit={handleSubmitRSVP}>
                        <div className="result-table-wrapper">
                            <h4>Membership Details</h4>
                            <table className="result-table" style={{ marginBottom: 10 }}>
                                <tbody>
                                    <tr>
                                        <th>Name</th>
                                        <td>{member.name}</td>
                                    </tr>
                                    <tr>
                                        <th>Address</th>
                                        <td>{member.address}</td>
                                    </tr>
                                    <tr>
                                        <th>Phone</th>
                                        <td>{member.phone}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="result-table-wrapper">
                            <h4>Select Events to RSVP</h4>
                            <table className="result-table">
                                <thead>
                                    <tr>
                                        <th>Program</th>
                                        <th>Event Name</th>
                                        <th>Event Date</th>
                                        <th>Select</th>
                                        <th>RSVP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((ev, idx) => {
                                        const isFirst = idx === 0 || ev.programname !== events[idx - 1].programname;
                                        const programCount = events.filter(
                                            (e) => e.programname === ev.programname
                                        ).length;

                                        return (
                                            <tr key={idx}>
                                                {isFirst && (
                                                    <td rowSpan={programCount}>{ev.programname}</td>
                                                )}
                                                <td>{ev.eventname}</td>
                                                <td>
                                                    {ev.eventday}, {displayDate(ev.eventdate)}
                                                </td>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEvents[idx] !== undefined}
                                                        onChange={(e) => toggleEventSelection(idx, e.target.checked)}
                                                    />
                                                </td>
                                                <td>
                                                    {selectedEvents[idx] !== undefined ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={rsvpCount}
                                                            onChange={(e) => setRsvpCount(e.target.value)}
                                                            placeholder="Count"
                                                            style={{ width: "60px" }}
                                                        />
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="inline-fields">
                            <label>Email Address</label>
                            <input className="small-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email Address" />
                            <button
                                className="button"
                                type="submit"
                                disabled={rsvpCount === "" || email === ""}
                                style={{
                                    backgroundColor: rsvpCount === "" || email === "" ? "grey" : "#007bff",
                                    cursor: rsvpCount === "" || email === "" ? "not-allowed" : "pointer",
                                }}
                            >
                                Submit RSVP
                            </button>
                        </div>
                    </form>
                )}

                {/* Success / error messages at bottom */}
                {submitSuccess && submitMessage && (
                    <div style={{ color: "green", marginTop: "10px" }}>
                        ✅ {submitMessage}
                        {confirmation && (
                            <div>Confirmation #: {confirmation.confNumber || confirmation?.confNumber}</div>
                        )}
                    </div>
                )}

                {!submitSuccess && submitMessage && (
                    <div style={{ color: "red", marginTop: "10px" }}>
                        ❌ {submitMessage}
                    </div>
                )}

            </div>
        </div>
        /*<div className="form-section">
          <h3>Submit RSVP (Life Member)</h3>
          <form onSubmit={handleSubmitRSVP}>
            {/* Search by MemberId
            <div className="form-group">
              <label>Member ID</label>
              <input
                type="text"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="Enter Member ID"
              />
            </div>
    
            {/* Search by Name + House
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
    
            {/* Email
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
    
            {/* RSVP Events
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
        </div>*/
    );
}
