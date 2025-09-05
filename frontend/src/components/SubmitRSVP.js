// frontend/src/components/SubmitRSVP.js
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

  // 🔥 New state for messages
  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // -------- Verify RSVP State --------
  const [verifyConfNumber, setVerifyConfNumber] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // -------- Modify RSVP Count --------
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
    setSubmitMessage(null);

    if (!member) {
      setError("Please search and select a member first.");
      return;
    }
    if (Object.keys(selectedEvents).length === 0) {
      setError("Please select at least one event and provide RSVP count.");
      return;
    }
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    const confNumber = Math.floor(100000 + Math.random() * 900000).toString();

    const payload = {
      memname: member.name,
      memaddress: member.address,
      memphonenumber: member.phone,
      email, // 🔥 include email
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
      setSubmitMessage("✅ RSVP submitted successfully!");
      setSubmitSuccess(true);

      // 🔥 Reset form after 15s and go Home
      setTimeout(() => {
        setSubmitMessage(null);
        setConfirmation(null);
        setMember(null);
        setSelectedEvents({});
        setEmail("");
        setActiveTab("home");
      }, 15000);
    } catch (err) {
      setSubmitMessage("❌ Error submitting RSVP: " + (err.message || "Unknown error"));
      setSubmitSuccess(false);
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
      setVerifyResult(data);
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

      setUpdateMessage("✅ RSVP updated successfully!");
      setUpdateError(null);

      // Refresh the verify results
      await handleVerifyRSVP({ preventDefault: () => {} });

      setEditIndex(null);

      // 🔥 Reset verify tab after 15s and go Home
      setTimeout(() => {
        setUpdateMessage(null);
        setEditIndex(null);
        setModifiedCount("");
        setVerifyConfNumber("");
        setVerifyResult(null);
        setActiveTab("home");
      }, 15000);
    } catch (err) {
      console.error("❌ Error updating RSVP:", err);
      setUpdateError(err.message || "Error updating RSVP.");
      setUpdateMessage(null);
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
          <form className="home">
            <h3>Welcome to JSMC RSVP Portal</h3>
            <h4>Please select Submit RSVP or Verify / Modify RSVP</h4>
          </form>
        )}

        {/* ----- TAB: Submit RSVP ----- */}
        {activeTab === "submit" && (
          <>
            {/* existing membership + search UI unchanged */}

            {member && (
              <form className="rsvp-form" onSubmit={handleSubmitRSVP}>
                {/* membership table, event selection unchanged */}

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
                    disabled={
                      submitting ||
                      !email ||
                      Object.keys(selectedEvents).length === 0
                    }
                  >
                    {submitting ? "Submitting..." : "Submit RSVP"}
                  </button>
                </div>
              </form>
            )}

            {submitMessage && (
              <div
                style={{
                  marginTop: "10px",
                  color: submitSuccess ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                {submitMessage}
                {submitSuccess && confirmation && (
                  <div>Confirmation #: {confirmation.confNumber}</div>
                )}
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
                    {updateMessage}
                  </div>
                )}
                {updateError && (
                  <div style={{ color: "red", marginBottom: "10px" }}>
                    {updateError}
                  </div>
                )}
                {/* verify results table unchanged */}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
