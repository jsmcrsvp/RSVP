// frontend/src/components/SubmitRSVP.js
import React, { useEffect, useState } from "react";
import {
  getOpenEvents,
  searchMember,
  submitRSVP,
  verifyRSVP,
  updateRSVP,
} from "../api";
import "../styles/SubmitRSVP.css";

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
  const [confirmation, setConfirmation] = useState(null);

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  // Load open events once
  useEffect(() => {
    (async () => {
      setLoadingEvents(true);
      try {
        const data = await getOpenEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
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
      const v = Number(selectedEvents[k]);
      return !isNaN(v) && v >= 0;
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
      setError("Please select at least one event and give it an RSVP count (>=0).");
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
          selectedEvents[idx] !== undefined
            ? {
                programname: ev.programname,
                eventname: ev.eventname,
                eventday: ev.eventday,
                eventdate: ev.eventdate,
                rsvpcount: Number(selectedEvents[idx]),
              }
            : null
        )
        .filter(Boolean),
    };

    setSubmitting(true);
    try {
      await submitRSVP(payload);
      setConfirmation({ confNumber });
      setSubmitMessage("RSVP submitted successfully!");
      setSubmitSuccess(true);

      setTimeout(() => {
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
        setActiveTab("home");
      }, 15000);
    } catch (err) {
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
      const data = await verifyRSVP(verifyConfNumber.trim());
      const normalized = data && Array.isArray(data.rsvps) ? data : { rsvps: [] };
      normalized.checked = true;
      setVerifyResult(normalized);
    } catch (err) {
      setError(err.message || "Error verifying RSVP.");
    } finally {
      setVerifying(false);
      setEditIndex(null);
      setModifiedCount("");
    }
  };

  const handleUpdateRSVP = async (rsvpId, newCount) => {
    try {
      await updateRSVP(rsvpId, parseInt(newCount, 10));
      await handleVerifyRSVP({ preventDefault: () => {} });
      setEditIndex(null);
      setUpdateMessage("RSVP updated successfully!");
      setUpdateError(null);

      setTimeout(() => {
        setVerifyConfNumber("");
        setVerifyResult(null);
        setEditIndex(null);
        setModifiedCount("");
        setUpdateMessage(null);
        setActiveTab("home");
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
    };
  };

  // -------- UI --------
  return (
    <div className="page-wrapper">
      <div className="rsvp-container">
        <h2>JSMC RSVP</h2>

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

        {error && <div className="error-message">{error}</div>}

        {/* HOME */}
        {activeTab === "home" && (
          <div className="home">
            <h3>Welcome to JSMC RSVP Portal</h3>
            <h4>Please select Submit RSVP or Verify / Modify RSVP</h4>
          </div>
        )}

        {/* SUBMIT */}
        {activeTab === "submit" && (
          <div className="submit-tab">
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
                {/* Search section ... (same as before) */}
                {/* (kept unchanged for brevity) */}
              </form>
            )}

            {isLifeMember === "yes" && member && (
              <form className="rsvp-form" onSubmit={handleSubmitRSVP}>
                {/* Member details + event table ... (same as before) */}
                {/* (kept unchanged for brevity) */}

                <div className="inline-fields">
                  <label>Email Address</label>
                  <input
                    className="small-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                  />
                  <button
                    className="button"
                    type="submit"
                    disabled={email.trim() === "" || !hasValidSelection()}
                    style={{
                      backgroundColor: email.trim() === "" || !hasValidSelection() ? "lightgray" : "#007bff",
                      color: email.trim() === "" || !hasValidSelection() ? "#666" : "white",
                      cursor: email.trim() === "" || !hasValidSelection() ? "not-allowed" : "pointer",
                    }}
                  >
                    Submit RSVP
                  </button>
                </div>
              </form>
            )}

            {/* Success / error messages */}
            {submitSuccess && submitMessage && (
              <div style={{ color: "green", marginTop: "10px" }}>
                ✅ {submitMessage}
                {confirmation && <div>Confirmation #: {confirmation.confNumber}</div>}
              </div>
            )}
            {!submitSuccess && submitMessage && (
              <div style={{ color: "red", marginTop: "10px" }}>❌ {submitMessage}</div>
            )}
          </div>
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

            {verifyResult && Array.isArray(verifyResult.rsvps) && verifyResult.rsvps.length > 0 && (
              <div className="result-table-wrapper">
                {/* Member + RSVP details (same as before) */}
              </div>
            )}

            {verifyResult && verifyResult.checked && Array.isArray(verifyResult.rsvps) && verifyResult.rsvps.length === 0 && (
              <div style={{ textAlign: "center", color: "#888", fontStyle: "italic", marginTop: "10px" }}>
                No RSVP records found for this confirmation number.
              </div>
            )}

            {updateMessage && <div style={{ color: "green", marginTop: "10px" }}>✅ {updateMessage}</div>}
            {updateError && <div style={{ color: "red", marginTop: "10px" }}>❌ {updateError}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
