// frontend/src/components/VerifyRSVP.js
import React, { useState } from "react";
import axios from "axios";

// Utility to format dates
const displayDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const VerifyRSVP = () => {
  const [verifyConfNumber, setVerifyConfNumber] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [modifiedCount, setModifiedCount] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateError, setUpdateError] = useState("");

  // Extract member details from verify result
  const verifyMemberFromResult = () => {
    if (verifyResult && Array.isArray(verifyResult.rsvps) && verifyResult.rsvps.length > 0) {
      const { name, address, phone, email } = verifyResult.rsvps[0];
      return { name, address, phone, email };
    }
    return {};
  };

  // Handle verify
  const handleVerifyRSVP = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setUpdateMessage("");
    setUpdateError("");
    try {
      const res = await axios.post("/api/verify-rsvp", { confNumber: verifyConfNumber });
      setVerifyResult({ ...res.data, checked: true });
    } catch (err) {
      console.error("Verify failed", err);
      setVerifyResult({ rsvps: [], checked: true });
      setUpdateError("Error verifying RSVP.");
    } finally {
      setVerifying(false);
    }
  };

  // Handle update of RSVP count
  const handleUpdateRSVP = async (rsvpId, count) => {
    setUpdateMessage("");
    setUpdateError("");
    try {
      await axios.post("/api/update-rsvp", { rsvpId, rsvpcount: count });
      setUpdateMessage("RSVP updated successfully.");
      // Update locally
      const updatedRsvps = verifyResult.rsvps.map((ev, idx) =>
        ev._id === rsvpId ? { ...ev, rsvpcount: count } : ev
      );
      setVerifyResult({ ...verifyResult, rsvps: updatedRsvps });
      setEditIndex(null);
    } catch (err) {
      console.error("Update failed", err);
      setUpdateError("Failed to update RSVP.");
    }
  };

  return (
    <form className="verify-form" onSubmit={handleVerifyRSVP}>
      <h3>Verify / Modify RSVP</h3>
      <div className="inline-fields">
        <input
          className="small-input"
          type="text"
          value={verifyConfNumber}
          onChange={(e) => setVerifyConfNumber(e.target.value)}
          placeholder="Enter Confirmation #"
        />
        <button className="button" type="submit" disabled={verifying}>
          {verifying ? "Verifying..." : "Verify"}
        </button>
      </div>

      {/* Show only when rsvps are returned */}
      {verifyResult && Array.isArray(verifyResult.rsvps) && verifyResult.rsvps.length > 0 && (
        <div className="result-table-wrapper">
          <h4>Current RSVP Details</h4>

          {/* Member details from first RSVP doc */}
          <table className="result-table" style={{ marginBottom: 10 }}>
            <tbody>
              <tr>
                <th>Name</th>
                <td>{verifyMemberFromResult()?.name}</td>
              </tr>
              <tr>
                <th>Address</th>
                <td>{verifyMemberFromResult()?.address}</td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>{verifyMemberFromResult()?.phone}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{verifyMemberFromResult()?.email}</td>
              </tr>
            </tbody>
          </table>

          {/* RSVP Events */}
          <table className="result-table">
            <thead>
              <tr>
                <th>Program</th>
                <th>Event Name</th>
                <th>Event Date</th>
                <th>Status</th>
                <th>RSVP</th>
                <th>Modify</th>
              </tr>
            </thead>
            <tbody>
              {verifyResult.rsvps.map((ev, idx) => (
                <tr key={ev._id || idx}>
                  <td>{ev.programname}</td>
                  <td>{ev.eventname}</td>
                  <td>
                    {ev.eventday}, {displayDate(ev.eventdate)}
                  </td>
                  <td>{ev.eventstatus}</td>
                  <td>
                    {editIndex === idx ? (
                      <input
                        type="number"
                        min="0"
                        value={modifiedCount}
                        onChange={(e) => setModifiedCount(e.target.value)}
                        style={{ width: "60px" }}
                      />
                    ) : (
                      ev.rsvpcount
                    )}
                  </td>
                  <td>
                    {ev.eventstatus === "Open" ? (
                      editIndex === idx ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateRSVP(ev._id, modifiedCount)}
                        >
                          Save
                        </button>
                      ) : (
                        <label>
                          <input
                            type="checkbox"
                            onChange={() => {
                              setEditIndex(idx);
                              setModifiedCount(ev.rsvpcount);
                            }}
                          />
                          Modify
                        </label>
                      )
                    ) : (
                      <span style={{ color: "gray" }}>Not Editable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No results case */}
      {verifyResult &&
        verifyResult.checked &&
        Array.isArray(verifyResult.rsvps) &&
        verifyResult.rsvps.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#888",
              fontStyle: "italic",
              marginTop: "10px",
            }}
          >
            No RSVP records found for this confirmation number or Event RSVP may
            be closed.
          </div>
        )}

      {/* Success / error messages */}
      {updateMessage && (
        <div style={{ color: "green", marginTop: "10px" }}>✅ {updateMessage}</div>
      )}
      {updateError && (
        <div style={{ color: "red", marginTop: "10px" }}>❌ {updateError}</div>
      )}
    </form>
  );
};

export default VerifyRSVP;
