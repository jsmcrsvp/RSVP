// frontend/src/components/MemberRSVP.js
import React, { useState, useEffect } from "react";
import "../styles/MemberRSVP.css";

export default function MemberRSVP({
  events,
  displayDate,
  toggleEventSelection,
  selectedEvents,
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

  // ---- Initialize RSVP counts per event as strings ----
  const [rsvpCounts, setRsvpCounts] = useState([]);
  const [kidsRsvpCounts, setKidsRsvpCounts] = useState([]);

  useEffect(() => {
    if (events && events.length > 0) {
      setRsvpCounts(Array(events.length).fill(""));
      setKidsRsvpCounts(Array(events.length).fill(""));
    }
  }, [events]);

  // ---- Handle Form Submit ----
  const onSubmit = (e) => {
    e.preventDefault();

    const selectedRSVPs = events
      .map((ev, idx) => {
        if (!selectedEvents[idx]) return null;
        return {
          eventId: ev._id || idx,
          eventname: ev.eventname,
          programname: ev.programname,
          eventday: ev.eventday,
          eventdate: ev.eventdate,
          adultCount: Number(rsvpCounts[idx]) || 0,
          kidCount: Number(kidsRsvpCounts[idx]) || 0,
        };
      })
      .filter(Boolean);

    if (
      selectedRSVPs.length === 0 ||
      email.trim() === "" ||
      selectedRSVPs.some(
        (r) =>
          r.adultCount < 0 || r.kidCount < 0 || isNaN(r.adultCount) || isNaN(r.kidCount)
      )
    ) {
      setError("Please select event(s) and enter valid adult/kids counts and email.");
      return;
    }

    setError("");
    handleSubmitRSVP(e, selectedRSVPs);
  };

  return (
    <>
      <h4 style={{ textAlign: "center", margin: 0, color: "#5d8cdf" }}>
        Life Membership Details
      </h4>

      <form className="rsvp-form" onSubmit={onSubmit}>
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
        <div style={{ overflowX: "auto", marginTop: 0, marginBottom: 0 }}>
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
                          checked={!!selectedEvents[idx]}
                          onChange={(e) => {
                            toggleEventSelection(idx, e.target.checked);
                            // Reset counts if unchecked
                            if (!e.target.checked) {
                              setRsvpCounts((prev) => {
                                const copy = [...prev];
                                copy[idx] = "";
                                return copy;
                              });
                              setKidsRsvpCounts((prev) => {
                                const copy = [...prev];
                                copy[idx] = "";
                                return copy;
                              });
                            }
                          }}
                        />
                      </td>
                      <td>
                        {selectedEvents[idx] ? (
                          <input
                            type="number"
                            min="0"
                            value={rsvpCounts[idx]}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRsvpCounts((prev) => {
                                const copy = [...prev];
                                copy[idx] = val;
                                //console.log(`Adult count updated for idx ${idx}:`, copy[idx]);
                                return copy;
                              });
                            }}
                            placeholder="Adults"
                            style={{ width: "60px", textAlign: "center" }}
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {selectedEvents[idx] ? (
                          <input
                            type="number"
                            min="0"
                            value={kidsRsvpCounts[idx]}
                            onChange={(e) => {
                              const val = e.target.value;
                              setKidsRsvpCounts((prev) => {
                                const copy = [...prev];
                                copy[idx] = val;
                                //console.log(`Kids count updated for idx ${idx}:`, copy[idx]);
                                return copy;
                              });
                            }}
                            placeholder="Kids"
                            style={{ width: "60px", textAlign: "center" }}
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
            disabled={submitting}
            style={{
              backgroundColor: submitting ? "grey" : "#007bff",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </>
  );
}



/* frontend/src/components/MemberRSVP.js
import React, { useState } from "react";
import "../styles/MemberRSVP.css";

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
          e.preventDefault();
          if (rsvpCount === "" || kidsRsvpCount === "" || email.trim() === "") {
            setError("Please fill adult, kids counts and email.");
            return;
          }
          setError("");
          handleSubmitRSVP(e);
        }}
      >

        {error && <div style={{ color: "red", marginBottom: "10px" }}>❌ {error}</div>}

        {/* Member Info
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

        {/* RSVP Event Table
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

        {/* Email + Submit
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

        {/* Submission Message
        {submitMessage && (
          {/*<div style={{ color: submitSuccess ? "green" : "red", marginTop: "10px" }}>
            {submitMessage}
          </div>
        )}
      </form >
    </>
  );
}
  */