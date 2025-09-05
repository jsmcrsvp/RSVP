// frontend/src/components/SubmitRSVP.js ======= Submit Working 090525 ====4:00pm =====
import React, { useEffect, useState } from "react";
import { getOpenEvents, searchMember, submitRSVP, verifyRSVP, updateRSVP } from "../api";
import "../styles/SubmitRSVP.css";

export default function SubmitRSVP() {
  const [activeTab, setActiveTab] = useState("home"); // "home" | "submit" | "verify"

  // -------- Shared State --------
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  // -------- Submit RSVP State --------
  const [isLifeMember, setIsLifeMember] = useState(null);
  const [searchMode, setSearchMode] = useState("");
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [member, setMember] = useState(null);

  const [selectedEvents, setSelectedEvents] = useState({});
  const [email, setEmail] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // -------- Verify RSVP State --------
  const [verifyConfNumber, setVerifyConfNumber] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // -------- Modify RSVP Count --------
  const [editIndex, setEditIndex] = useState(null);
  const [modifiedCount, setModifiedCount] = useState("");

  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const [updateMessage, setUpdateMessage] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  // Load open events once
  useEffect(() => {
    (async () => {
      setLoadingEvents(true);
      try {
        const data = await getOpenEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch {
        setError("Failed to load open events.");
      } finally {
        setLoadingEvents(false);
      }
    })();
  }, []);

  // ---- Submit RSVP Handlers ----
  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setMember(null);

    if (searchMode === "memberId" && !memberId.trim()) {
      setError("Member ID is required.");
      return;
    }
    if (
      searchMode === "nameHouse" &&
      (!name.trim() || !houseNumber.trim())
    ) {
      setError("Name and House # are required.");
      return;
    }

    setSearching(true);
    try {
      const payload =
        searchMode === "memberId"
          ? { memberId: memberId.trim() }
          : { name: name.trim(), houseNumber: houseNumber.trim() };

      const result = await searchMember(payload);
      if (result && result.name) {
        setMember(result);
      } else {
        setError("Member not found.");
      }
    } catch (err) {
      setError(err.message || "Error searching member.");
    } finally {
      setSearching(false);
    }
  };

  const toggleEventSelection = (eventId, checked) => {
    setSelectedEvents((prev) => {
      const copy = { ...prev };
      if (checked) {
        copy[eventId] = 1;
      } else {
        delete copy[eventId];
      }
      return copy;
    });
  };

  const updateEventCount = (eventId, value) => {
    setSelectedEvents((prev) => ({
      ...prev,
      [eventId]: value ? parseInt(value, 10) : 0,
    }));
  };

  const handleSubmitRSVP = async (e) => {
    e.preventDefault();
    setError("");
    setConfirmation(null);

    if (!member) {
      setError("Please search and select a member first.");
      return;
    }
    if (Object.keys(selectedEvents).length === 0) {
      setError("Please select at least one event and provide RSVP count.");
      return;
    }

    const confNumber = Math.floor(100000 + Math.random() * 900000).toString();

    const payload = {
      memname: member.name,
      memaddress: member.address,
      memphonenumber: member.phone,
      rsvpconfnumber: confNumber,
      events: events
        .filter((_, idx) => selectedEvents[idx] !== undefined)
        .map((ev, idx) => ({
          programname: ev.programname,
          eventname: ev.eventname,
          eventday: ev.eventday,
          eventdate: ev.eventdate,
          rsvpcount: selectedEvents[idx],
        })),
    };

    setSubmitting(true);
    try {
      const res = await submitRSVP(payload);
      setConfirmation({ confNumber, ...res });
      setSelectedEvents({});
      setSubmitMessage("RSVP submitted successfully!");
      setSubmitError(null);
    } catch (err) {
      setError(err.message || "Error submitting RSVP.");
      setSubmitError(err.message || "Error submitting RSVP.");
      setSubmitMessage(null);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Verify RSVP Handlers ----
  const handleVerifyRSVP = async (e) => {
    e.preventDefault();
    setError("");
    setVerifyResult(null);

    if (!verifyConfNumber.trim()) {
      setError("Confirmation number is required.");
      return;
    }

    setVerifying(true);
    try {
      const data = await verifyRSVP(verifyConfNumber.trim());

      //console.log("✅ RSVP verification response:", data);

      if (Array.isArray(data.rsvps) && data.rsvps.length > 0) {
        //console.log(`✅ Loaded ${data.rsvps.length} RSVP record(s).`);
      } else {
        console.warn("⚠️ No RSVP records found or rsvps is not an array.");
      }
      setVerifyResult(data);
      //setVerifyResult(data.rsvps || []);
    } catch (err) {
      console.error("❌ Error verifying RSVP:", err);
      setError(err.response?.data?.message || err.message || "Error verifying RSVP.");
    } finally {
      setVerifying(false);
    }
  };

  const handleUpdateRSVP = async (rsvpId, newCount) => {
    try {
      console.log("🔧 Sending update for RSVP:", rsvpId, "→", newCount);

      const result = await updateRSVP(rsvpId, parseInt(newCount, 10));

      console.log("✅ RSVP updated:", result);

      setUpdateMessage("RSVP updated successfully!");
      setUpdateError(null);

      // Refresh the verify results
      await handleVerifyRSVP({ preventDefault: () => { } });

      setEditIndex(null);

      // Clear success message after 3s
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (err) {
      console.error("❌ Error updating RSVP:", err);

      setUpdateError(err.message || "Error updating RSVP.");
      setUpdateMessage(null);

      // Clear error message after 5s
      setTimeout(() => setUpdateError(null), 5000);
    }
  };

  // -------- UI --------
  return (
    <div className="page-wrapper">
      <div className="rsvp-container">
        <h2>JSMC RSVP</h2>

        {/* Tabs */}
        <div className="tab-header">
          <button
            className={activeTab === "home" ? "tab active" : "tab"}
            onClick={() => setActiveTab("home")}
          >
            Home
          </button>
          <button
            className={activeTab === "submit" ? "tab active" : "tab"}
            onClick={() => setActiveTab("submit")}
          >
            Submit RSVP
          </button>
          <button
            className={activeTab === "verify" ? "tab active" : "tab"}
            onClick={() => setActiveTab("verify")}
          >
            Verify / Modify RSVP
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* ----- TAB: Home ----- */}
        {activeTab === "home" && (
          <>
            <form className="home">
              <h3>Welcome to JSMC RSVP Portal</h3>
              <h4>Please select Submit RSVP or Verify / Modify RSVP</h4>
            </form>
          </>
        )}

        {/* ----- TAB: Submit RSVP ----- */}
        {activeTab === "submit" && (
          <>
            {isLifeMember === null && (
              <div className="form-section">
                <h3>Are you JSMC Life Member?</h3>
                <label>
                  <input
                    type="radio"
                    name="lifeMember"
                    value="yes"
                    onChange={() => setIsLifeMember("yes")}
                  />
                  Yes
                </label>
                <label style={{ marginLeft: "1rem" }}>
                  <input
                    type="radio"
                    name="lifeMember"
                    value="no"
                    onChange={() => setIsLifeMember("no")}
                  />
                  No
                </label>
              </div>
            )}

            {isLifeMember === "no" && (
              <div className="message">
                Thank you. RSVP is only for Life Members.
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
                      disabled={searching}
                    >
                      {searching ? "Searching..." : "Search"}
                    </button>
                  </div>
                )}

                {searchMode === "nameHouse" && (
                  <div className="inline-fields">
                    <input
                      className="small-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="First Name"
                    />
                    <input
                      className="small-input"
                      type="text"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      placeholder="House #"
                    />
                    <button
                      className="button"
                      type="submit"
                      disabled={searching}
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
                  <table className="result-table">
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
                        <th>Select</th>
                        <th>Program</th>
                        <th>Event</th>
                        <th>Date</th>
                        <th>RSVP Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((ev, idx) => (
                        <tr key={idx}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedEvents[idx] !== undefined}
                              onChange={(e) =>
                                toggleEventSelection(idx, e.target.checked)
                              }
                            />
                          </td>
                          <td>{ev.programname}</td>
                          <td>{ev.eventname}</td>
                          <td>
                            {ev.eventday}, {ev.eventdate}
                          </td>
                          <td>
                            {selectedEvents[idx] !== undefined && (
                              <input
                                type="number"
                                className="small-input"
                                style={{ maxWidth: "40px" }}
                                min="0"
                                max="99"
                                value={selectedEvents[idx]}
                                onChange={(e) =>
                                  updateEventCount(idx, e.target.value)
                                }
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="inline-fields">
                  <label>Email Address</label>
                  <input
                    className="small-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                  />

                  {Object.keys(selectedEvents).length > 0 && (
                    <button
                      className="button"
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit RSVP"}
                    </button>
                  )}
                  {submitMessage && (
                    <div style={{ color: "green", marginBottom: "10px" }}>
                      ✅ {submitMessage}
                    </div>
                  )}
                  {submitError && (
                    <div style={{ color: "red", marginBottom: "10px" }}>
                      ❌ {submitError}
                    </div>
                  )}
                </div>
              </form>
            )}

            {confirmation && (
              <div className="result-table-wrapper">
                <h4>RSVP Confirmation</h4>
                <table className="result-table">
                  <tbody>
                    <tr>
                      <th>Confirmation #</th>
                      <td>{confirmation.confNumber}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ----- TAB: Verify RSVP ----- */}
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
            {verifyResult && (
              <div className="result-table-wrapper">
                <h4>RSVP Details</h4>
                {updateMessage && (
                  <div style={{ color: "green", marginBottom: "10px" }}>
                    ✅ {updateMessage}
                  </div>
                )}
                {updateError && (
                  <div style={{ color: "red", marginBottom: "10px" }}>
                    ❌ {updateError}
                  </div>
                )}
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Event</th>
                      <th>Date</th>
                      <th>RSVP Count</th>
                      <th>Modify</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifyResult.rsvps?.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", color: "#888", fontStyle: "italic" }}>
                          No RSVP records found for this confirmation number.
                        </td>
                      </tr>
                    )}

                    {verifyResult.rsvps?.map((ev, idx) => (
                      <tr key={ev._id}>
                        <td>{ev.programname}</td>
                        <td>{ev.eventname}</td>
                        <td>{ev.eventday}, {ev.eventdate}</td>
                        <td>
                          {editIndex === idx ? (
                            <input
                              type="number"
                              min="1"
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
                            <button onClick={() => handleUpdateRSVP(ev._id, modifiedCount)}>
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
          </form>
        )}
      </div>
    </div>
  );
}
