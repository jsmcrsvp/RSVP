// frontend/src/components/SubmitRSVP/NonMemberRSVP.js
import React from "react";
import "../styles/SubmitRSVP.css";

export default function NonMemberRSVP({
  events,
  displayDate,
  toggleEventSelection,
  selectedEvents,
  rsvpCount,
  setRsvpCount,
  nonMemberName,
  setNonMemberName,
  nonMemberAddress,
  setNonMemberAddress,
  nonMemberPhone,
  setNonMemberPhone,
  nonMemberEmail,
  setNonMemberEmail,
  handleSubmitRSVP,
  submitting,
  submitMessage,
  submitSuccess,
}) {
  return (
    <form className="rsvp-form" onSubmit={handleSubmitRSVP}>
      <h4>Enter Non-Member Details</h4>
      <div className="form-section">
        <label>Name:</label>
        <input
          type="text"
          value={nonMemberName}
          onChange={(e) => setNonMemberName(e.target.value)}
          required
        />
        <label>Address:</label>
        <input
          type="text"
          value={nonMemberAddress}
          onChange={(e) => setNonMemberAddress(e.target.value)}
          required
        />
        <label>Phone:</label>
        <input
          type="tel"
          value={nonMemberPhone}
          onChange={(e) => setNonMemberPhone(e.target.value)}
          required
        />
        {/*<label>Email:</label>
        <input
          type="email"
          value={nonMemberEmail}
          onChange={(e) => setNonMemberEmail(e.target.value)}
          required
        />*/}
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
        <input className="small-input" type="email" value={nonMemberEmail} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email Address" />
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

      {/*
      <div className="inline-fields">
        <button
          className="button"
          type="submit"
          disabled={submitting}
          style={{
            backgroundColor: submitting ? "lightgray" : "#007bff",
            color: submitting ? "#666" : "white",
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Submitting..." : "Submit RSVP"}
        </button>
      </div>

      {submitMessage && (
        <div
          style={{
            marginTop: "10px",
            color: submitSuccess ? "green" : "red",
          }}
        >
          {submitMessage}
        </div>
      )} */}

    </form>
  );
}
