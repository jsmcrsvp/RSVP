// frontend/src/components/NonMemberRSVP.js
import React, { useEffect, useState } from "react";
import "../styles/NonMemberRSVP.css";

export default function NonMemberRSVP({
  events,
  displayDate,
  toggleEventSelection,
  selectedEvents,
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
  // ---- Initialize RSVP counts per event as strings ----
  const [rsvpCounts, setRsvpCounts] = useState(events.map(() => ""));
  const [kidsRsvpCounts, setKidsRsvpCounts] = useState(events.map(() => ""));
  const [phoneError, setPhoneError] = useState("");

  // Format phone: "(XXX) YYY-ZZZZ"
  const formatPhoneNumber = (value) => {
    if (!value) return "";
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length === 0) return "";
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneChange = (e) => setNonMemberPhone(formatPhoneNumber(e.target.value));

  // Validate phone
  useEffect(() => {
    const digits = (nonMemberPhone || "").replace(/\D/g, "");
    if (digits.length === 0) setPhoneError("");
    else if (digits.length !== 10) setPhoneError("Phone number must be exactly 10 digits.");
    else setPhoneError("");
  }, [nonMemberPhone]);

  const isPhoneValid = (nonMemberPhone || "").replace(/\D/g, "").length === 10;

  // Check if at least one selected event has valid RSVP counts
  const hasValidSelection = () =>
    Object.keys(selectedEvents).some(
      (idx) =>
        selectedEvents[idx] &&
        ((Number(rsvpCounts[idx]) || 0) > 0 || (Number(kidsRsvpCounts[idx]) || 0) > 0)
    );

  // ---- Form Submit ----
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

    if (selectedRSVPs.length === 0) {
      alert("Please select at least one event.");
      return;
    }

    if (!nonMemberEmail.trim()) {
      alert("Please enter an email address.");
      return;
    }

    if (!isPhoneValid) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    handleSubmitRSVP(e, selectedRSVPs);
  };

  return (
    <form className="rsvp-form" onSubmit={onSubmit}>
      <h3>Enter Non-Member Details</h3>

      <div className="rsvp-form-table">
        <div className="form-row">
          <label>Name:</label>
          <input
            type="text"
            value={nonMemberName}
            onChange={(e) => setNonMemberName(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="form-row">
          <label>Address:</label>
          <input
            type="text"
            value={nonMemberAddress}
            onChange={(e) => setNonMemberAddress(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="form-row">
          <label>Phone:</label>
          <input
            type="tel"
            value={nonMemberPhone}
            onChange={handlePhoneChange}
            required
            className="input-field"
          />
          {phoneError && <div className="field-error">{phoneError}</div>}
        </div>
      </div>

      <h3 style={{ textAlign: "center", margin: "0.5rem 0", color: "#5d8cdf" }}>
        Select Events to RSVP
      </h3>

      <div className="result-table-wrapper">
        <table className="result-table">
          <thead>
            <tr>
              <th>Program</th>
              <th>Event Name</th>
              <th>Event Date</th>
              <th>Select</th>
              <th>Adults</th>
              <th>Kids</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev, idx) => {
              const isFirst = idx === 0 || ev.programname !== events[idx - 1].programname;
              const programCount = events.filter((e) => e.programname === ev.programname).length;

              return (
                <tr key={idx}>
                  {isFirst && <td rowSpan={programCount}>{ev.programname}</td>}
                  <td>{ev.eventname}</td>
                  <td>{ev.eventday}, {displayDate(ev.eventdate)}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selectedEvents[idx]}
                      onChange={(e) => {
                        toggleEventSelection(idx, e.target.checked);
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
                            return copy;
                          });
                        }}
                        placeholder="Adult"
                        style={{ width: "60px" }}
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
                            return copy;
                          });
                        }}
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
          disabled={submitting || !hasValidSelection() || nonMemberEmail.trim() === "" || !isPhoneValid}
          style={{
            backgroundColor:
              submitting || !hasValidSelection() || nonMemberEmail.trim() === "" || !isPhoneValid
                ? "grey"
                : "#007bff",
            color: "white",
            cursor:
              submitting || !hasValidSelection() || nonMemberEmail.trim() === "" || !isPhoneValid
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