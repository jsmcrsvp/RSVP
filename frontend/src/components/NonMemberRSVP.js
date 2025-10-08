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

    console.log("RSVP Counts (adults):", rsvpCounts);
    console.log("RSVP Counts (kids):", kidsRsvpCounts);

    const selectedRSVPs = events
      .map((ev, idx) => {
        if (!selectedEvents[idx]) return null;
        return {
          eventId: ev._id || idx,
          eventname: ev.eventname,
          programname: ev.programname,
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





/* frontend/src/components/NonMemberRSVP.js ==== Commented on 10/8/25 4:40pm
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
  // Initialize per-event RSVP counts
  const [rsvpCounts, setRsvpCounts] = useState(events.map(() => 0));
  const [kidsRsvpCounts, setKidsRsvpCounts] = useState(events.map(() => 0));

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

  const handlePhoneChange = (e) => {
    setNonMemberPhone(formatPhoneNumber(e.target.value));
  };

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

  return (
    <form
      className="rsvp-form"
      onSubmit={(e) => {
        e.preventDefault();

        const selectedRSVPs = events
          .map((ev, idx) => {
            if (!selectedEvents[idx]) return null;
            return {
              eventId: ev._id || idx,
              eventname: ev.eventname,
              programname: ev.programname,
              eventdate: ev.eventdate,
              //adultCount: rsvpCounts[idx] ?? 0,
              //kidCount: kidsRsvpCounts[idx] ?? 0,
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

        // Pass both e and structured RSVP data to parent
        handleSubmitRSVP(e, selectedRSVPs);
      }}
    >
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
                  <td>
                    {ev.eventday}, {displayDate(ev.eventdate)}
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selectedEvents[idx]}
                      onChange={(e) => toggleEventSelection(idx, e.target.checked)}
                    />
                  </td>
                  <td>
                    {selectedEvents[idx] ? (
                      <input
                        type="number"
                        min="0"
                        value={rsvpCounts[idx] ?? 0}
                        onChange={(e) => {
                          //const val = e.target.value;
                          const val = Number(e.target.value) || 0;
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
                        value={kidsRsvpCounts[idx] ?? 0}
                        onChange={(e) => {
                          //const val = e.target.value;
                          const val = Number(e.target.value) || 0;
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
          disabled={
            submitting || !hasValidSelection() || nonMemberEmail.trim() === "" || !isPhoneValid
          }
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
*/






/* frontend/src/components/NonMemberRSVP.js
import React, { useEffect, useState } from "react";
import "../styles/NonMemberRSVP.css";

export default function NonMemberRSVP({
  events,
  displayDate,
  toggleEventSelection,
  selectedEvents,
  rsvpCount,
  setRsvpCount,
  kidsRsvpCount,
  setKidsRsvpCount,
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

  // Format helper: "(XXX) YYY-ZZZZ"
  const formatPhoneNumber = (value) => {
    if (!value) return "";
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length === 0) return "";
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneChange = (e) => {
    setNonMemberPhone(formatPhoneNumber(e.target.value));
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

  // Helper to check at least one count is >0 for selected events
  const hasValidSelection = () =>
    Object.keys(selectedEvents).some(
      (k) =>
        (Number(rsvpCount || 0) > 0 || Number(kidsRsvpCount || 0) > 0) &&
        selectedEvents[k] !== undefined
    );

  return (
    <form
      className="rsvp-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!hasValidSelection()) {
          alert("Please select at least one event and enter adult or kids RSVP count.");
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
        handleSubmitRSVP(e);
      }}
    >
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
    {phoneError && (
      <div className="field-error">{phoneError}</div>
    )}
  </div>
</div>




      {/* ===========================================
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
            onChange={handlePhoneChange}
            required
            className="input-field"
            style={{ width: "200px" }}
          />
          {phoneError && (
            <div
              className="field-error"
              style={{ color: "red", fontSize: "0.9em", marginTop: "4px" }}
            >
              {phoneError}
            </div>
          )}
        </div>
      </div>
      ===========================================
      <h3 style={{ textAlign: "center", margin: "0rem 0 0.5rem 0", color: "#5d8cdf" }}>
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
              const programCount = events.filter(
                (e) => e.programname === ev.programname
              ).length;

              return (
                <tr key={idx}>
                  {isFirst && <td rowSpan={programCount}>{ev.programname}</td>}
                  <td>{ev.eventname}</td>
                  <td>{ev.eventday}, {displayDate(ev.eventdate)}</td>
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
                        placeholder="Adult"
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
          disabled={
            submitting ||
            (!hasValidSelection() || nonMemberEmail.trim() === "" || !isPhoneValid)
          }
          style={{
            backgroundColor:
              submitting ||
                (!hasValidSelection() || nonMemberEmail.trim() === "" || !isPhoneValid)
                ? "grey"
                : "#007bff",
            color: "white",
            cursor:
              submitting ||
                (!hasValidSelection() || nonMemberEmail.trim() === "" || !isPhoneValid)
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