// frontend/src/components/NonMemberRSVP.js
import React, { useEffect, useState } from "react";
//import "../styles/SubmitRSVP.css";
import "../styles/NonMemberRSVP.css"

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
}) {
  const [phoneError, setPhoneError] = useState("");

  // Format helper: returns formatted "(XXX) YYY-ZZZZ" (partial formatting while typing)
  const formatPhoneNumber = (value) => {
    if (!value) return "";
    const digits = value.replace(/\D/g, "").slice(0, 10); // keep up to 10 digits
    if (digits.length === 0) return "";
    if (digits.length < 4) return digits;
    if (digits.length < 7) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const formatted = formatPhoneNumber(raw);
    setNonMemberPhone(formatted);
    // phoneError handled in effect below
  };

  // Validate phone whenever nonMemberPhone changes
  useEffect(() => {
    const digits = (nonMemberPhone || "").replace(/\D/g, "");
    if (digits.length === 0) {
      setPhoneError("");
    } else if (digits.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits.");
    } else {
      setPhoneError("");
    }
  }, [nonMemberPhone]);

  const digitsOnly = (nonMemberPhone || "").replace(/\D/g, "");
  const isPhoneValid = digitsOnly.length === 10;

  return (
    <form className="rsvp-form" onSubmit={handleSubmitRSVP}>
      <h4>Enter Non-Member Details</h4>
      <div className="form-section">
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={nonMemberName}
            onChange={(e) => setNonMemberName(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Address:</label>
          <input
            type="text"
            value={nonMemberAddress}
            onChange={(e) => setNonMemberAddress(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Phone:</label>
          <input
            type="tel"
            value={nonMemberPhone}
            onChange={(e) => {
              let cleaned = e.target.value.replace(/\D/g, "");
              if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);

              let formatted = cleaned;
              if (cleaned.length > 6) {
                formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
              } else if (cleaned.length > 3) {
                formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
              } else if (cleaned.length > 0) {
                formatted = `(${cleaned}`;
              }

              setNonMemberPhone(formatted);
            }}
            required
            className="input-field"
          />
        </div>

{/*============================
        <label>Name:</label>
        <input
          type="text"
          value={nonMemberName}
          onChange={(e) => setNonMemberName(e.target.value)}
          required
          className="input-field"
        />

        <label>Address:</label>
        <input
          type="text"
          value={nonMemberAddress}
          onChange={(e) => setNonMemberAddress(e.target.value)}
          required
          className="input-field"
        />

        <label>Phone:</label>
        <input type="tel" value={nonMemberPhone} onChange={(e) => {
          // Strip all non-digits
          let cleaned = e.target.value.replace(/\D/g, "");
          if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);

          // Apply (XXX) YYY-ZZZZ format
          let formatted = cleaned;
          if (cleaned.length > 6) {
            formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
          } else if (cleaned.length > 3) {
            formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
          } else if (cleaned.length > 0) {
            formatted = `(${cleaned}`;
          }

          setNonMemberPhone(formatted);
        }}
          required
          className="input-field"
        />
*/}
        {/*<label>Phone:</label>
        <input
          type="tel"
          value={nonMemberPhone}
          onChange={handlePhoneChange}
          placeholder="(123) 456-7890"
          required
        />*/}

        {phoneError && (
          <div className="field-error" style={{ color: "red", fontSize: "0.9em", marginTop: "4px" }}>
            {phoneError}
          </div>
        )}
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
        <label>Email Address:</label>
        <input
          className="input-field"
          type="email"
          value={nonMemberEmail}
          onChange={(e) => setNonMemberEmail(e.target.value)}
          placeholder="Enter Email Address"
          required
        />
        <button
          className="button"
          type="submit"
          disabled={submitting || rsvpCount === "" || nonMemberEmail === "" || !isPhoneValid}
          style={{
            backgroundColor:
              submitting || rsvpCount === "" || nonMemberEmail === "" || !isPhoneValid
                ? "grey"
                : "#007bff",
            color: "white",
            cursor:
              submitting || rsvpCount === "" || nonMemberEmail === "" || !isPhoneValid
                ? "not-allowed"
                : "pointer",
          }}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}



/* frontend/src/components/NonMemberRSVP.js
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
        <label>Email Address:</label>
        <input
          className="small-input"
          type="email"
          value={nonMemberEmail}
          onChange={(e) => setNonMemberEmail(e.target.value)}
          placeholder="Enter Email Address"
          required
        />
        <button
          className="button"
          type="submit"
          disabled={submitting || rsvpCount === "" || nonMemberEmail === ""}
          style={{
            backgroundColor:
              submitting || rsvpCount === "" || nonMemberEmail === ""
                ? "grey"
                : "#007bff",
            color: "white",
            cursor:
              submitting || rsvpCount === "" || nonMemberEmail === ""
                ? "not-allowed"
                : "pointer",
          }}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}
*/