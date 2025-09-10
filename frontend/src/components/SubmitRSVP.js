// frontend/src/components/SubmitRSVP.js
import React, { useEffect, useState } from "react";
import { getOpenEvents, searchMember, submitRSVP, verifyRSVP, updateRSVP, } from "../api";
import "../styles/SubmitRSVP.css";

export default function SubmitRSVP() {
  const [activeTab, setActiveTab] = useState("home"); // "home" | "submit" | "verify"

  // Shared
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  // Submit states
  const [isLifeMember, setIsLifeMember] = useState(null);
  const [searchMode, setSearchMode] = useState("");
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [member, setMember] = useState(null);

  const [selectedEvents, setSelectedEvents] = useState({}); // { idx: count }
  const [email, setEmail] = useState("");
  const [rsvpCount, setRsvpCount] = useState("");   // RSVP count (0 or more)
  const [confirmation, setConfirmation] = useState(null);

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Submit messaging / success
  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Verify states
  const [verifyConfNumber, setVerifyConfNumber] = useState("");
  const [verifyResult, setVerifyResult] = useState({ rsvps: [] }); // always an object with rsvps array
  const [verifying, setVerifying] = useState(false);

  // Modify RSVP
  const [editIndex, setEditIndex] = useState(null);
  const [modifiedCount, setModifiedCount] = useState("");
  const [updateMessage, setUpdateMessage] = useState(null);
  const [updateError, setUpdateError] = useState(null);


  // Load open events once
  useEffect(() => {
    (async () => {
      setLoadingEvents(true);
      try {
        console.log("Loading open events...");
        const data = await getOpenEvents();
        setEvents(Array.isArray(data) ? data : []);
        console.log("Open events loaded:", Array.isArray(data) ? data.length : 0);
      } catch (err) {
        console.error("Failed to load open events:", err);
        setError("Failed to load open events.");
      } finally {
        setLoadingEvents(false);
      }
    })();
  }, []);

  // -------- Submit handlers --------
  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setMember(null);
    if (searchMode !== "memberId" && searchMode !== "nameHouse") {
      setError("Choose a search mode first.");
      return;
    }
    if (searchMode === "memberId" && !memberId.trim()) {
      setError("Member ID is required.");
      return;
    }
    if (searchMode === "nameHouse" && (!name.trim() || !houseNumber.trim())) {
      setError("Name and House # are required.");
      return;
    }

    setSearching(true);
    try {
      const payload =
        searchMode === "memberId"
          ? { memberId: memberId.trim() }
          : { name: name.trim(), houseNumber: houseNumber.trim() };

      console.log("Searching member with payload:", payload);
      const result = await searchMember(payload);
      console.log("Search result:", result);
      if (result && result.name) {
        setMember(result);
      } else {
        setError("Member not found.");
      }
    } catch (err) {
      console.error("Error searching member:", err);
      setError(err.message || "Error searching member.");
    } finally {
      setSearching(false);
    }
  };

  const toggleEventSelection = (eventId, checked) => {
    setSelectedEvents((prev) => {
      const copy = { ...prev };
      if (checked) copy[eventId] = copy[eventId] ?? 1;
      else delete copy[eventId];
      return copy;
    });
  };

  const updateEventCount = (eventId, value) => {
    setSelectedEvents((prev) => ({
      ...prev,
      [eventId]: value ? parseInt(value, 10) : 0,
    }));
  };

  const hasValidSelection = () => {
    // at least one event selected & count > 0
    return Object.keys(selectedEvents).some((k) => {
      const v = Number(selectedEvents[k]);
      return !isNaN(v) && v > 0;
    });
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
              //rsvpcount: Number(selectedEvents[idx]),
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
        // Reset all submit tab states
        setSubmitMessage(null);
        setSubmitSuccess(false);
        setConfirmation(null);
        setMember(null);
        setSelectedEvents({});
        setEmail("");
        setIsLifeMember(null);
        setSearchMode("");
        setMemberId("");
        setName("");
        setHouseNumber("");

        // Switch to Home
        setActiveTab("home");
      }, 15000);

    } catch (err) {
      console.error("Error submitting RSVP:", err);
      setSubmitMessage("Error submitting RSVP: " + (err.message || "Unknown"));
      setSubmitSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  // -------- Verify handlers --------
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
      console.log("Calling verifyRSVP for:", verifyConfNumber.trim());
      const data = await verifyRSVP(verifyConfNumber.trim());
      console.log("Verify response:", data);
      // normalize shape: ensure object with rsvps array
      const normalized = data && Array.isArray(data.rsvps) ? data : { rsvps: [] };
      setVerifyResult(normalized);
    } catch (err) {
      console.error("Error verifying RSVP:", err);
      setError(err.response?.data?.message || err.message || "Error verifying RSVP.");
    } finally {
      setVerifying(false);
      setEditIndex(null);
      setModifiedCount("");
    }
  };

  const handleUpdateRSVP = async (rsvpId, newCount) => {
    try {
      console.log("🔧 Sending update for RSVP:", rsvpId, "→", newCount);
      const result = await updateRSVP(rsvpId, parseInt(newCount, 10));
      console.log("✅ RSVP updated:", result);

      const successMsg = "RSVP updated successfully!";

      // Refresh verify results
      await handleVerifyRSVP({ preventDefault: () => { } });
      setEditIndex(null);

      // Show success AFTER refresh
      setUpdateMessage(successMsg);
      setUpdateError(null);

      // After 15s clear everything and return to Home
      setTimeout(() => {
        setVerifyConfNumber("");
        setVerifyResult(null);
        setEditIndex(null);
        setModifiedCount("");
        setUpdateMessage(null);
        setActiveTab("home");
      }, 15000);
    } catch (err) {
      console.error("❌ Error updating RSVP:", err);
      setUpdateError(err.message || "Error updating RSVP.");
      setUpdateMessage(null);

      setTimeout(() => setUpdateError(null), 5000);
    }
  };

  // Helper to extract member info from verifyResult.rsvps (first doc)
  const verifyMemberFromResult = () => {
    const arr = verifyResult?.rsvps ?? [];
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const first = arr[0];
    return {
      name: first.memname || "",
      address: first.memaddress || "",
      phone: first.memphonenumber || "",
    };
  };

  // -------- UI --------
  return (
    <div className="page-wrapper">
      <div className="rsvp-container">
        <h2>JSMC RSVP</h2>

        {/* Tabs */}
        {/*<div className="tab-header">
          <button className={activeTab === "home" ? "tab active" : "tab"} onClick={() => setActiveTab("home")}>
            Home
          </button>
          <button className={activeTab === "submit" ? "tab active" : "tab"} onClick={() => setActiveTab("submit")}>
            Submit RSVP
          </button>
          <button className={activeTab === "verify" ? "tab active" : "tab"} onClick={() => setActiveTab("verify")}>
            Verify / Modify RSVP
          </button>
        </div>*/}

        {error && <div className="error-message">{error}</div>}

        {/* HOME */}
        {activeTab === "home" && (
          <div className="home">
            <h4>Welcome to JSMC RSVP Portal</h4>

            {/* Open Events Table */}
<div className="result-table-wrapper" style={{ marginTop: "10px" }}>
  <h4>Current Open Events to Submit or Modify RSVP</h4>

  {Array.isArray(events) && events.length > 0 ? (
    <table className="result-table" style={{ marginBottom: "15px" }}>
      <thead>
        <tr>
          <th>Program</th>
          <th>Event</th>
          <th>Event Date</th>
          <th>RSVP By</th>
        </tr>
      </thead>
      <tbody>
        {events.map((ev, idx) => {
          // Check if this is the first event for this program
          const isFirst = idx === 0 || ev.programname !== events[idx - 1].programname;
          // Count how many events belong to this program
          const programCount = events.filter(
            (e) => e.programname === ev.programname
          ).length;

          return (
            <tr key={ev._id || idx}>
              {isFirst && (
                <td rowSpan={programCount}>{ev.programname}</td>
              )}
              <td>{ev.eventname}</td>
              <td>{ev.eventday}, {ev.eventdate}</td>
              <td>{ev.closersvp}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ) : (
    <p style={{ fontStyle: "italic", color: "#666" }}>
      No open events available at this time.
    </p>
  )}
</div>

            <h4>Please select Submit RSVP or Verify / Modify RSVP Tab</h4>
          </div>
        )}
        {/* Tabs */}
        <div className="tab-header">
          <button className={activeTab === "home" ? "tab active" : "tab"} onClick={() => setActiveTab("home")}>
            Home
          </button>
          <button className={activeTab === "submit" ? "tab active" : "tab"} onClick={() => setActiveTab("submit")}>
            Submit RSVP
          </button>
          <button className={activeTab === "verify" ? "tab active" : "tab"} onClick={() => setActiveTab("verify")}>
            Verify / Modify RSVP
          </button>
        </div>

        {/* SUBMIT */}
        {activeTab === "submit" && (
          <>
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

            {isLifeMember === "no" && <div className="message">Thank you. RSVP is only for Life Members.</div>}

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
              {ev.eventday}, {ev.eventdate}
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
                  {/*<input className="small-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required />*/}
                  {/*<button
                    className="button"
                    type="submit"
                    disabled={email.trim() === "" || rsvpCount === "" || isNaN(rsvpCount)}
                    style={{
                      backgroundColor: email.trim() === "" || rsvpCount === "" || isNaN(rsvpCount)
                        ? "lightgray"
                        : "#007bff",
                      color: email.trim() === "" || rsvpCount === "" || isNaN(rsvpCount)
                        ? "#666"
                        : "white",
                      cursor: email.trim() === "" || rsvpCount === "" || isNaN(rsvpCount)
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    Submit RSVP
                  </button>*/}
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
          </>
        )}

{/* VERIFY */}
{activeTab === "verify" && (
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
        <h4>RSVP Details</h4>

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
                <td>{ev.eventday}, {ev.eventdate}</td>
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
            {verifyResult && verifyResult.checked && Array.isArray(verifyResult.rsvps) && verifyResult.rsvps.length === 0 && (
              <div style={{ textAlign: "center", color: "#888", fontStyle: "italic", marginTop: "10px" }}>
                No RSVP records found for this confirmation number or Event RSVP may be closed.
              </div>
            )}

            {/* Success / error messages at bottom */}
            {updateMessage && (
              <div style={{ color: "green", marginTop: "10px" }}>
                ✅ {updateMessage}
              </div>
            )}
            {updateError && (
              <div style={{ color: "red", marginTop: "10px" }}>
                ❌ {updateError}
              </div>
            )}

  </form>
)}

        {/*{activeTab === "verify" && (
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

            {/* Show only when rsvps is returned
            {verifyResult && Array.isArray(verifyResult.rsvps) && verifyResult.rsvps.length > 0 && (
              <div className="result-table-wrapper">
                <h4>RSVP Details</h4>

                {/* Member details from first RSVP doc
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
                  </tbody>
                </table>

                {/* RSVP Events
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Event Name</th>
                      <th>Event Date</th>
                      <th>RSVP</th>
                      <th>Modify</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifyResult.rsvps.map((ev, idx) => (
                      <tr key={ev._id || idx}>
                        <td>{ev.programname}</td>
                        <td>{ev.eventname}</td>
                        <td>{ev.eventday}, {ev.eventdate}</td>
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
                          {editIndex === idx ? (
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
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* No results case
            {verifyResult && verifyResult.checked && Array.isArray(verifyResult.rsvps) && verifyResult.rsvps.length === 0 && (
              <div style={{ textAlign: "center", color: "#888", fontStyle: "italic", marginTop: "10px" }}>
                No RSVP records found for this confirmation number or Event RSVP may be closed.
              </div>
            )}

            {/* Success / error messages at bottom
            {updateMessage && (
              <div style={{ color: "green", marginTop: "10px" }}>
                ✅ {updateMessage}
              </div>
            )}
            {updateError && (
              <div style={{ color: "red", marginTop: "10px" }}>
                ❌ {updateError}
              </div>
            )}
          </form>
        )}*/}
      </div>
    </div>
  );
}
