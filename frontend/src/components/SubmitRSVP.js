// frontend/src/components/SubmitRSVP.js
import React, { useEffect, useState } from "react";
//import { getOpenEvents, searchMember, submitRSVP, verifyRSVP, updateRSVP,} from "../api"; Commented 10/1
import { getOpenEvents, getMember, submitRSVP, verifyRSVP, updateRSVP, } from "../api";
import "../styles/SubmitRSVP.css";
import logo from "../assets/JSMCLogo.jpg";

import MemberRSVP from "./MemberRSVP";
import NonMemberRSVP from "./NonMemberRSVP";
import VerifyRSVP from "./VerifyRSVP";


export default function SubmitRSVP() {
  const [activeTab, setActiveTab] = useState("home");

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

  const [selectedEvents, setSelectedEvents] = useState({});
  const [email, setEmail] = useState("");
  const [rsvpCount, setRsvpCount] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Submit messaging / success
  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Verify states
  const [verifyConfNumber, setVerifyConfNumber] = useState("");
  const [verifyResult, setVerifyResult] = useState({ rsvps: [] });
  const [verifying, setVerifying] = useState(false);

  // Modify RSVP
  const [editIndex, setEditIndex] = useState(null);
  const [modifiedCount, setModifiedCount] = useState("");
  const [updateMessage, setUpdateMessage] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  // Non-member fields
  const [nonMemberName, setNonMemberName] = useState("");
  const [nonMemberAddress, setNonMemberAddress] = useState("");
  const [nonMemberPhone, setNonMemberPhone] = useState("");
  const [nonMemberEmail, setNonMemberEmail] = useState("");

  // ---------------- New: shared reset function ----------------
  const resetAll = () => {
    // Submit side
    setIsLifeMember(null);
    setSearchMode("");
    setMemberId("");
    setName("");
    setHouseNumber("");
    setMember(null);
    setSelectedEvents({});
    setEmail("");
    setRsvpCount("");
    setConfirmation(null);
    setSubmitMessage(null);
    setSubmitSuccess(false);
    setError("");
    setSearching(false);
    setSubmitting(false);

    // Verify side
    setVerifyConfNumber("");
    setVerifyResult({ rsvps: [] });
    setVerifying(false);
    setEditIndex(null);
    setModifiedCount("");
    setUpdateMessage(null);
    setUpdateError(null);
  };

  const handleTabChange = (tab) => {
    if (tab === "home") {
      resetAll();
    }
    setActiveTab(tab);
  };
  // ------------------------------------------------------------

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
      //const result = await searchMember(payload); Commented 10/1
      const result = await getMember(payload);
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
    return Object.keys(selectedEvents).some((k) => {
      const v = Number(selectedEvents[k] || rsvpCount);
      return !isNaN(v) && v > 0;
    });
  };

  const handleSubmitRSVP = async (e) => {
    e.preventDefault();
    setError("");
    setConfirmation(null);
    setSubmitMessage(null);

    // Validation
    if (isLifeMember === "yes" && !member) {
      setError("Please search and select a member first.");
      return;
    }
    if (!hasValidSelection()) {
      setError("Please select at least one event and give it an RSVP count (>0).");
      return;
    }

    // Non-member email check
    if (isLifeMember === "no" && !nonMemberEmail.trim()) {
      setError("Please enter an email address.");
      return;
    }

    // Member email check
    if (isLifeMember === "yes" && !email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    const confNumber = Math.floor(100000 + Math.random() * 900000).toString();

    // Build events array
    const eventsPayload = events
      .map((ev, idx) =>
        selectedEvents[idx] !== undefined && Number(rsvpCount) >= 0
          ? {
            programname: ev.programname,
            eventname: ev.eventname,
            eventday: ev.eventday,
            eventdate: ev.eventdate,
            rsvpcount: Number(rsvpCount),
          }
          : null
      )
      .filter(Boolean);

    // Pick correct fields depending on member vs non-member
    const payload =
      isLifeMember === "yes"
        ? {
          memname: member?.name || "",
          memaddress: member?.address || "",
          memphonenumber: member?.phone || "",
          mememail: email.trim(),
          rsvpconfnumber: confNumber,
          events: eventsPayload,
        }
        : {
          memname: nonMemberName,
          memaddress: nonMemberAddress,
          memphonenumber: nonMemberPhone,
          mememail: nonMemberEmail.trim(),
          rsvpconfnumber: confNumber,
          events: eventsPayload,
        };

    console.log("Submitting RSVP Payload:", payload);

    setSubmitting(true);
    try {
      /* ==== Commented due to mail issue ======
      const res = await submitRSVP(payload);
      console.log("Submit response:", res);
      setConfirmation({ confNumber, ...res });
      setSubmitMessage("RSVP submitted successfully!");
      setSubmitSuccess(true);*/

      /* ==== Added due to mail issue ======*/
try {
  const res = await submitRSVP(payload);
  console.log("Submit response:", res);

  setConfirmation({ confNumber, ...res });
  setSubmitMessage(
    res.emailError
      ? "RSVP submitted SUCCESSFULLY! (Email could not be sent)"
      : "RSVP submitted SUCCESSFULLY!"
  );
  setSubmitSuccess(true);
} catch (err) {
  console.error("Error submitting RSVP:", err);
  setSubmitMessage("Error submitting RSVP: " + (err.message || "Unknown"));
  setSubmitSuccess(false);
}
      /* ==== Added due to mail issue ======*/

      // Reset after delay
      setTimeout(() => {
        setSubmitMessage(null);
        setSubmitSuccess(false);
        setConfirmation(null);
        setMember(null);
        setSelectedEvents({});
        setEmail("");
        setNonMemberName("");
        setNonMemberAddress("");
        setNonMemberPhone("");
        setNonMemberEmail("");
        setIsLifeMember(null);
        setSearchMode("");
        setMemberId("");
        setName("");
        setHouseNumber("");
        setRsvpCount("");
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
        setVerifyResult({ rsvps: [] });
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
      email: first.mememail || "",
    };
  };

  // Utility to format YYYY-MM-DD → MM/DD/YYYY
  const displayDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
  };

  // -------- UI --------
  return (
    <div className="page-wrapper">
      <div className="rsvp-container">
        {/* ✅ Logo at the top */}
        <div className="logo-wrapper">
          <img src={logo} alt="JSMC Logo" className="rsvp-logo" />
        </div>
        {error && <div className="error-message">{error}</div>}
        {/* HOME */}
        {activeTab === "home" && (
          <div className="home">
            <h4>Welcome to JSMC RSVP Portal</h4>
            <h4>Current Open Events to Submit or Modify RSVP</h4>

            {/* Open Events Table */}
            <div className="result-table-wrapper" style={{ marginTop: "10px" }}>
              {Array.isArray(events) && events.length > 0 ? (
                <table className="result-table" style={{ marginBottom: "20px" }}>
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Event Name</th>
                      <th>Event Date</th>
                      <th>RSVP By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev, idx) => {
                      // Check if this is the first event for this program
                      const isFirst = idx === 0 || ev.programname !== events[idx - 1].programname;
                      // Count how many events belong to this program
                      const programCount = events.filter((e) => e.programname === ev.programname).length;

                      return (
                        <tr key={ev._id || idx}>
                          {isFirst && <td rowSpan={programCount}>{ev.programname}</td>}
                          <td>{ev.eventname}</td>
                          <td>{ev.eventday}, {displayDate(ev.eventdate)}</td>
                          <td>{displayDate(ev.closersvp)}</td>
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
          <button className={activeTab === "home" ? "tab active" : "tab"} onClick={() => handleTabChange("home")}>
            Home
          </button>
          <button className={activeTab === "submit" ? "tab active" : "tab"} onClick={() => handleTabChange("submit")}>
            Submit RSVP
          </button>
          <button className={activeTab === "verify" ? "tab active" : "tab"} onClick={() => handleTabChange("verify")}>
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

            {/* Non-member flow: render NonMemberRSVP component */}
            {isLifeMember === "no" && (
              <NonMemberRSVP
                events={events}
                displayDate={displayDate}
                toggleEventSelection={toggleEventSelection}
                selectedEvents={selectedEvents}
                rsvpCount={rsvpCount}
                setRsvpCount={setRsvpCount}
                nonMemberName={nonMemberName}
                setNonMemberName={setNonMemberName}
                nonMemberAddress={nonMemberAddress}
                setNonMemberAddress={setNonMemberAddress}
                nonMemberPhone={nonMemberPhone}
                setNonMemberPhone={setNonMemberPhone}
                nonMemberEmail={nonMemberEmail}
                setNonMemberEmail={setNonMemberEmail}
                handleSubmitRSVP={handleSubmitRSVP}
                submitting={submitting}
              />
            )}

            {/* Member search UI (keeps your existing search behavior) */}
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
                    <span className="inline-label">First Name:</span>
                    <input
                      className="small-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter First Name"
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

            {/* Member found: render MemberRSVP component (keeps your RSVP UI) */}
            {member && (
              <MemberRSVP
                events={events}
                displayDate={displayDate}
                toggleEventSelection={toggleEventSelection}
                selectedEvents={selectedEvents}
                rsvpCount={rsvpCount}
                setRsvpCount={setRsvpCount}
                email={email}
                setEmail={setEmail}
                member={member}
                setMember={setMember}
                handleSubmitRSVP={handleSubmitRSVP}
                submitting={submitting}
                submitMessage={submitMessage}
                submitSuccess={submitSuccess}
              />
            )}

            {/* Success / error messages at bottom*/}
            {submitSuccess && submitMessage && (
              /* ====== Commented due to email issue
              <div style={{ color: "green", marginTop: "10px" }}>
                ✅ {submitMessage}
                {confirmation && (
                  <div>Confirmation #: {confirmation.confNumber || confirmation?.confNumber}</div>
                )}
              </div>*/

              /* ====== Added due to email issue */
              <div style={{ color: "green", marginTop: "10px" }}>
                ✅ {submitMessage}
                {confirmation?.confNumber && (
                  <div>Confirmation #: {confirmation.confNumber}</div>
                )}
                {confirmation?.emailWarning && (
                  <div style={{ color: "orange", marginTop: "5px" }}>
                    ⚠️ RSVP saved, but email could not be sent.
                  </div>
                )}
              </div>
            /* ====== Added due to email issue */
            )}

        {!submitSuccess && submitMessage && (
          <div style={{ color: "red", marginTop: "10px" }}>
            ❌ {submitMessage}
          </div>
        )}
      </>
        )}

      {/* VERIFY */}
      {activeTab === "verify" && <VerifyRSVP />}
    </div>
    </div >
  );
}
