// frontend/src/components/MemberRSVP.js
import React, { useState } from "react";
import "../styles/MemberRSVP.css";
//import "../styles/SubmitRSVP.css";

export default function MemberRSVP({
  events,
  displayDate,
  toggleEventSelection,
  selectedEvents,
  rsvpCount,
  setRsvpCount,
  kidsRsvpCount,
  setKidsRsvpCount,
  email,
  setEmail,
  member,
  setMember,
  handleSubmitRSVP,
  submitting,
  submitMessage,
  submitSuccess,
}) {
  const [error, setError] = useState("");

  return (
    <>
      <h4 style={{ textAlign: "center", margin: "0 0 0 0", color: "#5d8cdf" }}>
        Life Membership Details
      </h4>
      <form
        className="rsvp-form"
        onSubmit={(e) => {
          e.preventDefault(); // stop form default submission
          if (rsvpCount === "" || kidsRsvpCount === "" || email.trim() === "") {
            setError("Please fill adult, kids counts and email.");
            return;
          }
          setError("");
          handleSubmitRSVP(e); // <-- pass the event here
        }}
      >

        {error && <div style={{ color: "red", marginBottom: "10px" }}>❌ {error}</div>}

        {/* Member Info */}
        <div className="result-table-wrapper">
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

        {/* RSVP Event Table */}
        <div style={{ overflowX: "auto", marginTop: "0rem", marginBottom: "0rem" }}>
          <h4>Select Events to RSVP</h4>
          <div className="result-table-wrapper">
            <table className="result-table" style={{ marginTop: 0 }}>
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Event Name</th>
                  <th>Event Date</th>
                  <th>Select</th>
                  <th>Adult RSVP</th>
                  <th>Kids RSVP</th>
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
                    <tr key={idx}>
                      {isFirst && <td rowSpan={programCount}>{ev.programname}</td>}
                      <td>{ev.eventname}</td>
                      <td>
                        {ev.eventday}, {displayDate(ev.eventdate)}
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedEvents[idx] !== undefined}
                          onChange={(e) =>
                            toggleEventSelection(idx, e.target.checked)
                          }
                        />
                      </td>
                      <td>
                        {selectedEvents[idx] !== undefined ? (
                          <input
                            type="number"
                            min="0"
                            value={rsvpCount}
                            onChange={(e) => setRsvpCount(e.target.value)}
                            placeholder="Adults"
                            style={{ width: "60px" }}
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {selectedEvents[idx] !== undefined ? (
                          <input
                            type="number"
                            min="0"
                            value={kidsRsvpCount}
                            onChange={(e) => setKidsRsvpCount(e.target.value)}
                            placeholder="Kids"
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
        </div>

        {/* Email + Submit */}
        <div className="inline-fields">
          <label>Email Address</label>
          <input
            className="small-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email Address"
          />
          <button
            className="button"
            type="submit"
            disabled={
              submitting ||
              rsvpCount === "" ||
              kidsRsvpCount === "" ||
              email.trim() === ""
            }
            style={{
              backgroundColor:
                submitting ||
                  rsvpCount === "" ||
                  kidsRsvpCount === "" ||
                  email.trim() === ""
                  ? "grey"
                  : "#007bff",
              cursor:
                submitting ||
                  rsvpCount === "" ||
                  kidsRsvpCount === "" ||
                  email.trim() === ""
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>

        {/* Submission Message */}
        {submitMessage && (
          {/*<div style={{ color: submitSuccess ? "green" : "red", marginTop: "10px" }}>
            {submitMessage}
          </div>*/}
        )}
      </form >
    </>
  );
}



{/*// frontend/src/components/MemberRSVP.js ===== Working 091625 ==== 5:00pm
import React from "react";
import "../styles/SubmitRSVP.css";

export default function MemberRSVP({
  events,
  displayDate,
  toggleEventSelection,
  selectedEvents,
  rsvpCount,
  setRsvpCount,
  email,
  setEmail,
  member,
  setMember,
  handleSubmitRSVP,
  submitting,
  submitMessage,
  submitSuccess,
}) {
  return (
      <>
      <h4 style={{ textAlign: "center", margin: "0 0 0 0", color: "#5d8cdf" }}>
        Life Membership Details</h4>
      <form className="rsvp-form" onSubmit={handleSubmitRSVP}>
        {/*<h4>Life Membership Details</h4>
        <div className="result-table-wrapper">
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
        
      <h4 style={{ textAlign: "center", margin: "0 0 0 0", color: "#5d8cdf" }}>
        Select Events to RSVP</h4>
        {/*<h4>Current RSVP Details</h4>
        <div className="result-table-wrapper">
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
                const isFirst =
                  idx === 0 || ev.programname !== events[idx - 1].programname;
                const programCount = events.filter(
                  (e) => e.programname === ev.programname
                ).length;

                return (
                  <tr key={idx}>
                    {isFirst && <td rowSpan={programCount}>{ev.programname}</td>}
                    <td>{ev.eventname}</td>
                    <td>
                      {ev.eventday}, {displayDate(ev.eventdate)}
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedEvents[idx] !== undefined}
                        onChange={(e) =>
                          toggleEventSelection(idx, e.target.checked)
                        }
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
            disabled={submitting || rsvpCount === "" || email === ""}
            style={{
              backgroundColor: submitting || rsvpCount === "" || email === "" ? "grey" : "#007bff",
              cursor: submitting || rsvpCount === "" || email === "" ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
      </>
      );
}
*/}
