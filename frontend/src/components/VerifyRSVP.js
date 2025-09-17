// frontend/src/components/VerifyRSVP.js
import React, { useState } from "react";
import { verifyRSVP, updateRSVP } from "../api";
import "../styles/SubmitRSVP.css";

export default function VerifyRSVP() {
  const [verifyConfNumber, setVerifyConfNumber] = useState("");
  const [verifyResult, setVerifyResult] = useState({ rsvps: [], checked: false });
  const [verifying, setVerifying] = useState(false);

  const [editIndex, setEditIndex] = useState(null);
  const [modifiedAdultCount, setModifiedAdultCount] = useState("");
  const [modifiedKidsCount, setModifiedKidsCount] = useState("");
  const [updateMessage, setUpdateMessage] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [error, setError] = useState("");

  // Fetch RSVP by confirmation number
  const handleVerifyRSVP = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setVerifyResult({ rsvps: [], checked: false });
    setUpdateMessage(null);
    setUpdateError(null);

    if (!verifyConfNumber.trim()) {
      setError("Confirmation number is required.");
      return;
    }

    setVerifying(true);
    try {
      const data = await verifyRSVP(verifyConfNumber.trim());
      const normalized = data && Array.isArray(data.rsvps) 
        ? { ...data, checked: true } 
        : { rsvps: [], checked: true };
      setVerifyResult(normalized);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error verifying RSVP.");
    } finally {
      setVerifying(false);
      setEditIndex(null);
      setModifiedAdultCount("");
      setModifiedKidsCount("");
    }
  };

  // Update RSVP counts (adults + kids)
  const handleUpdateRSVP = async (rsvpId) => {
    try {
      await updateRSVP(rsvpId, {
        rsvpcount: parseInt(modifiedAdultCount, 10),
        kidsrsvpcount: parseInt(modifiedKidsCount, 10),
      });

      // Re-fetch updated RSVP
      await handleVerifyRSVP({ preventDefault: () => {} });

      setEditIndex(null);
      setUpdateMessage("RSVP updated successfully!");
      setUpdateError(null);

      setTimeout(() => {
        setVerifyConfNumber("");
        setVerifyResult({ rsvps: [], checked: false });
        setEditIndex(null);
        setModifiedAdultCount("");
        setModifiedKidsCount("");
        setUpdateMessage(null);
      }, 15000);
    } catch (err) {
      setUpdateError(err.message || "Error updating RSVP.");
      setUpdateMessage(null);
      setTimeout(() => setUpdateError(null), 5000);
    }
  };

  // Helper to display member info
  const verifyMemberFromResult = () => {
    const arr = verifyResult?.rsvps ?? [];
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const first = arr[0];
    return {
      name: first.memname || "",
      address: first.memaddress || "",
      phone: first.memphonenumber || "",
      email: first.mememail || "",
    };
  };

  // Helper to format date as MM/DD/YYYY
  const displayDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
  };

  return (
    <form className="verify-form" onSubmit={handleVerifyRSVP}>
      <h3>Verify / Modify RSVP</h3>

      {error && <div className="error-message">{error}</div>}

      {/* Confirmation Number Input */}
      {!verifyResult.checked && (
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
      )}

      {/* Results */}
      {verifyResult.checked && Array.isArray(verifyResult.rsvps) && verifyResult.rsvps.length > 0 && (
        <>
          <h4 style={{ textAlign: "center", margin: "1rem 0 0.5rem 0", color: "#5d8cdf" }}>
            Current RSVP Details
          </h4>

          {/* Member Info Table */}
          <div className="result-table-wrapper">
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
          </div>

          {/* RSVP Table */}
          <div className="result-table-wrapper">
            <table className="result-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Event Name</th>
                  <th>Event Date</th>
                  <th>Status</th>
                  <th>Adult RSVP</th>
                  <th>Kids RSVP</th>
                  <th>Modify</th>
                </tr>
              </thead>
              <tbody>
                {verifyResult.rsvps.map((ev, idx) => (
                  <tr key={ev._id || idx}>
                    <td>{ev.programname}</td>
                    <td>{ev.eventname}</td>
                    <td>{ev.eventday}, {displayDate(ev.eventdate)}</td>
                    <td>{ev.eventstatus}</td>

                    {/* Adult RSVP */}
                    <td>
                      {editIndex === idx ? (
                        <input
                          type="number"
                          min="0"
                          value={modifiedAdultCount}
                          onChange={(e) => setModifiedAdultCount(e.target.value)}
                          style={{ width: "60px" }}
                        />
                      ) : (
                        ev.rsvpcount
                      )}
                    </td>

                    {/* Kids RSVP */}
                    <td>
                      {editIndex === idx ? (
                        <input
                          type="number"
                          min="0"
                          value={modifiedKidsCount}
                          onChange={(e) => setModifiedKidsCount(e.target.value)}
                          style={{ width: "60px" }}
                        />
                      ) : (
                        ev.kidsrsvpcount
                      )}
                    </td>

                    {/* Modify / Save Button */}
                    <td>
                      {ev.eventstatus === "Open" ? (
                        editIndex === idx ? (
                          <button type="button" onClick={() => handleUpdateRSVP(ev._id)}>
                            Save
                          </button>
                        ) : (
                          <label>
                            <input
                              type="checkbox"
                              onChange={() => {
                                setEditIndex(idx);
                                setModifiedAdultCount(ev.rsvpcount);
                                setModifiedKidsCount(ev.kidsrsvpcount);
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
        </>
      )}

      {/* No Results */}
      {verifyResult.checked && Array.isArray(verifyResult.rsvps) && verifyResult.rsvps.length === 0 && (
        <div style={{ textAlign: "center", color: "#888", fontStyle: "italic", marginTop: "10px" }}>
          No RSVP records found for this confirmation number or Event RSVP may be closed.
        </div>
      )}

      {/* Success / Error Messages */}
      {updateMessage && <div style={{ color: "green", marginTop: "10px" }}>✅ {updateMessage}</div>}
      {updateError && <div style={{ color: "red", marginTop: "10px" }}>❌ {updateError}</div>}
    </form>
  );
}




{/*// frontend/src/components/VerifyRSVP.js ====== Working 091625 ==== 5:00pm =====
import React, { useState } from "react";
import { verifyRSVP, updateRSVP } from "../api";
import "../styles/SubmitRSVP.css";

export default function VerifyRSVP() {
  const [verifyConfNumber, setVerifyConfNumber] = useState("");
  const [verifyResult, setVerifyResult] = useState({ rsvps: [], checked: false });
  const [verifying, setVerifying] = useState(false);

  const [editIndex, setEditIndex] = useState(null);
  const [modifiedCount, setModifiedCount] = useState("");
  const [updateMessage, setUpdateMessage] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [error, setError] = useState("");

  const handleVerifyRSVP = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setVerifyResult({ rsvps: [], checked: false });
    setUpdateMessage(null);
    setUpdateError(null);
    if (!verifyConfNumber.trim()) {
      setError("Confirmation number is required.");
      return;
    }

    setVerifying(true);
    try {
      const data = await verifyRSVP(verifyConfNumber.trim());
      const normalized =
        data && Array.isArray(data.rsvps)
          ? { ...data, checked: true }
          : { rsvps: [], checked: true };
      setVerifyResult(normalized);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error verifying RSVP.");
    } finally {
      setVerifying(false);
      setEditIndex(null);
      setModifiedCount("");
    }
  };

  const handleUpdateRSVP = async (rsvpId, newCount) => {
    try {
      await updateRSVP(rsvpId, parseInt(newCount, 10));
      await handleVerifyRSVP({ preventDefault: () => { } });
      setEditIndex(null);
      setUpdateMessage("RSVP updated successfully!");
      setUpdateError(null);

      setTimeout(() => {
        setVerifyConfNumber("");
        setVerifyResult({ rsvps: [], checked: false });
        setEditIndex(null);
        setModifiedCount("");
        setUpdateMessage(null);
      }, 15000);
    } catch (err) {
      setUpdateError(err.message || "Error updating RSVP.");
      setUpdateMessage(null);
      setTimeout(() => setUpdateError(null), 5000);
    }
  };

  const verifyMemberFromResult = () => {
    const arr = verifyResult?.rsvps ?? [];
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const first = arr[0];
    return {
      name: first.memname || "",
      address: first.memaddress || "",
      phone: first.memphonenumber || "",
      email: first.mememail || "",
    };
  };

  const displayDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
  };

  return (
    <form className="verify-form" onSubmit={handleVerifyRSVP}>
      {error && <div className="error-message">{error}</div>}
      {/* Hide input + button once verified
      {!verifyResult.checked && (
        <>
          <h4 style={{ textAlign: "center", margin: "1rem 0 0.5rem 0", color: "#5d8cdf" }}>
            Verify / Modify RSVP
          </h4>
          <div className="inline-fields">
            <span className="inline-label">Confirmation #:</span>
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
        </>
      )}

      {/* Results
      {verifyResult && Array.isArray(verifyResult.rsvps) && verifyResult.rsvps.length > 0 && (
        <>
          <h4 style={{ textAlign: "center", margin: "1rem 0 0.5rem 0", color: "#5d8cdf" }}>
            Current RSVP Details
          </h4>
          <div className="result-table-wrapper">
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
          </div>

          <div className="result-table-wrapper">
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
                    <td>{ev.eventday}, {displayDate(ev.eventdate)}</td>
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
        </>
      )}

      {/* No results case
      {verifyResult && verifyResult.checked && Array.isArray(verifyResult.rsvps) && verifyResult.rsvps.length === 0 && (
        <div style={{ textAlign: "center", color: "#888", fontStyle: "italic", marginTop: "10px" }}>
          No RSVP records found for this confirmation number or Event RSVP may be closed.
        </div>
      )}

      {/* Success / error messages at bottom
      {updateMessage && (
        <div style={{ color: "green", marginTop: "10px" }}>✅ {updateMessage}</div>
      )}
      {updateError && (
        <div style={{ color: "red", marginTop: "10px" }}>❌ {updateError}</div>
      )}
    </form>
  );
}
*/}



{/* frontend/src/components/VerifyRSVP.js ==== Working 09162025 ===== 3:00pm ------
import React, { useState } from "react";
import { verifyRSVP, updateRSVP } from "../api";
import "../styles/SubmitRSVP.css";

export default function VerifyRSVP() {
  const [verifyConfNumber, setVerifyConfNumber] = useState("");
  const [verifyResult, setVerifyResult] = useState({ rsvps: [] });
  const [verifying, setVerifying] = useState(false);

  const [editIndex, setEditIndex] = useState(null);
  const [modifiedCount, setModifiedCount] = useState("");
  const [updateMessage, setUpdateMessage] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [error, setError] = useState("");

  const handleVerifyRSVP = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setVerifyResult({ rsvps: [] });
    setUpdateMessage(null);
    setUpdateError(null);
    if (!verifyConfNumber.trim()) {
      setError("Confirmation number is required.");
      return;
    }

    setVerifying(true);
    try {
      const data = await verifyRSVP(verifyConfNumber.trim());
      const normalized =
        data && Array.isArray(data.rsvps) ? { ...data, checked: true } : { rsvps: [], checked: true };
      setVerifyResult(normalized);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error verifying RSVP.");
    } finally {
      setVerifying(false);
      setEditIndex(null);
      setModifiedCount("");
    }
  };

  const handleUpdateRSVP = async (rsvpId, newCount) => {
    try {
      await updateRSVP(rsvpId, parseInt(newCount, 10));

      await handleVerifyRSVP({ preventDefault: () => { } });
      setEditIndex(null);

      setUpdateMessage("RSVP updated successfully!");
      setUpdateError(null);

      setTimeout(() => {
        setVerifyConfNumber("");
        setVerifyResult({ rsvps: [] });
        setEditIndex(null);
        setModifiedCount("");
        setUpdateMessage(null);
      }, 15000);
    } catch (err) {
      setUpdateError(err.message || "Error updating RSVP.");
      setUpdateMessage(null);
      setTimeout(() => setUpdateError(null), 5000);
    }
  };

  const verifyMemberFromResult = () => {
    const arr = verifyResult?.rsvps ?? [];
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const first = arr[0];
    return {
      name: first.memname || "",
      address: first.memaddress || "",
      phone: first.memphonenumber || "",
      email: first.mememail || "",
    };
  };

  const displayDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
  };

  return (
    <form className="verify-form" onSubmit={handleVerifyRSVP}>
      <h3>Verify / Modify RSVP</h3>
      {error && <div className="error-message">{error}</div>}

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

      {/* Results

      {verifyResult && Array.isArray(verifyResult.rsvps) && verifyResult.rsvps.length > 0 && (
        <>
          <h4 style={{ textAlign: "center", margin: "1rem 0 0.5rem 0", color: "#5d8cdf" }}>
            Current RSVP Details
          </h4>
          <div className="result-table-wrapper">
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
          </div>

          <div className="result-table-wrapper">
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
                    <td>{ev.eventday}, {displayDate(ev.eventdate)}</td>
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
        </>
      )}

      {/* No results case
      {verifyResult && verifyResult.checked && Array.isArray(verifyResult.rsvps) && verifyResult.rsvps.length === 0 && (
        <div style={{ textAlign: "center", color: "#888", fontStyle: "italic", marginTop: "10px" }}>
          No RSVP records found for this confirmation number or Event RSVP may be closed.
        </div>
      )}

      {/* Success / error messages at bottom
      {updateMessage && (
        <div style={{ color: "green", marginTop: "10px" }}>✅ {updateMessage}</div>
      )}
      {updateError && (
        <div style={{ color: "red", marginTop: "10px" }}>❌ {updateError}</div>
      )}
    </form>
  );
}
*/}