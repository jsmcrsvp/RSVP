// TestHome.js
import React, { useEffect, useRef, useState } from "react";
import { getOpenEvents, getMember, submitRSVP, verifyRSVP, updateRSVP } from "../api";
import "../styles/Home.css"; // your filename — you said you'll manage naming
import logo from "../assets/JSMCLogo.jpg";

import MemberRSVP from "./MemberRSVP";
import NonMemberRSVP from "./NonMemberRSVP";
import VerifyRSVP from "./VerifyRSVP";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [isLifeMember, setIsLifeMember] = useState(null);
  const [searchMode, setSearchMode] = useState("");
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [member, setMember] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState({});
  const [email, setEmail] = useState("");
  const [rsvpCount, setRsvpCount] = useState("");
  const [kidsRsvpCount, setKidsRsvpCount] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [verifyConfNumber, setVerifyConfNumber] = useState("");
  const [verifyResult, setVerifyResult] = useState({ rsvps: [] });
  const [verifying, setVerifying] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [modifiedCount, setModifiedCount] = useState("");
  const [updateMessage, setUpdateMessage] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [nonMemberName, setNonMemberName] = useState("");
  const [nonMemberAddress, setNonMemberAddress] = useState("");
  const [nonMemberPhone, setNonMemberPhone] = useState("");
  const [nonMemberEmail, setNonMemberEmail] = useState("");

  const memberIdRef = useRef(null);
  const firstNameRef = useRef(null);

  // preserve the reset logic
  const resetAll = () => {
    setIsLifeMember(null);
    setSearchMode("");
    setMemberId("");
    setName("");
    setHouseNumber("");
    setMember(null);
    setSelectedEvents({});
    setEmail("");
    setRsvpCount("");
    setKidsRsvpCount("");
    setConfirmation(null);
    setSubmitMessage(null);
    setSubmitSuccess(false);
    setError("");
    setSearching(false);
    setSubmitting(false);
    setVerifyConfNumber("");
    setVerifyResult({ rsvps: [] });
    setVerifying(false);
    setEditIndex(null);
    setModifiedCount("");
    setUpdateMessage(null);
    setUpdateError(null);
  };

  const handleTabChange = (tab) => {
    setError("");
    if ((tab === "submit" || tab === "verify") && (!Array.isArray(events) || events.length === 0)) return;
    if (tab === "home") resetAll();
    setActiveTab(tab);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.zoom = "100%";
  }, []);

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

  useEffect(() => {
    setError("");
    if (searchMode === "memberId" && memberIdRef.current) memberIdRef.current.focus();
    if (searchMode === "nameHouse" && firstNameRef.current) firstNameRef.current.focus();
  }, [searchMode]);

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setMember(null);
    if (searchMode !== "memberId" && searchMode !== "nameHouse") return setError("Choose a search mode first.");
    if (searchMode === "memberId" && !memberId.trim()) return setError("Member ID is required.");
    if (searchMode === "nameHouse" && (!name.trim() || !houseNumber.trim())) return setError("Name and House # are required.");

    setSearching(true);
    try {
      const payload = searchMode === "memberId" ? { memberId: memberId.trim() } : { name: name.trim(), houseNumber: houseNumber.trim() };
      const result = await getMember(payload);
      if (result && result.name) setMember(result);
      else setError("Member not found.");
    } catch (err) {
      setError(err.response?.status === 404 ? "Member Not Found" : err.message || "Error searching member.");
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
    setSelectedEvents((prev) => ({ ...prev, [eventId]: value ? parseInt(value, 10) : 0 }));
  };

  const hasValidSelection = () => Object.keys(selectedEvents).some((k) => Number(selectedEvents[k] || rsvpCount) > 0);

  const handleSubmitRSVP = async (e, selectedRSVPsFromChild) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setError(""); setConfirmation(null); setSubmitMessage(null);
    if (isLifeMember === "yes" && !member) return setError("Please search and select a member first.");

    let eventsPayload = [];
    if (Array.isArray(selectedRSVPsFromChild) && selectedRSVPsFromChild.length > 0) {
      eventsPayload = selectedRSVPsFromChild.map((s) => ({
        programname: s.programname ?? s.programName ?? s.program ?? "",
        eventname: s.eventname ?? s.eventName ?? s.event ?? "",
        eventday: s.eventday ?? s.eventDay ?? "",
        eventdate: s.eventdate ?? s.eventDate ?? "",
        rsvpcount: Number(s.adultCount ?? s.rsvpcount ?? s.adultcount ?? 0) || 0,
        kidsrsvpcount: Number(s.kidCount ?? s.kidsrsvpcount ?? s.kidcount ?? 0) || 0,
      })).filter(Boolean);
    } else {
      eventsPayload = events.map((ev, idx) => selectedEvents[idx] !== undefined ? {
        programname: ev.programname,
        eventname: ev.eventname,
        eventday: ev.eventday,
        eventdate: ev.eventdate,
        rsvpcount: Number(rsvpCount) || 0,
        kidsrsvpcount: Number(kidsRsvpCount) || 0,
      } : null).filter(Boolean);
    }

    if (!Array.isArray(eventsPayload) || eventsPayload.length === 0) return setError("Please select at least one event and give it an RSVP count (>0).");

    const confNumber = Math.floor(100000 + Math.random() * 900000).toString();
    const payload = isLifeMember === "yes" ? {
      memname: member?.name || "", memaddress: member?.address || "", memphonenumber: member?.phone || "", mememail: email.trim(),
      rsvpconfnumber: confNumber, events: eventsPayload
    } : {
      memname: nonMemberName, memaddress: nonMemberAddress, memphonenumber: nonMemberPhone, mememail: nonMemberEmail.trim(),
      rsvpconfnumber: confNumber, events: eventsPayload
    };

    setSubmitting(true);
    try {
      const res = await submitRSVP(payload);
      setConfirmation({ confNumber, ...res });
      setSubmitMessage("RSVP submitted successfully!");
      setSubmitSuccess(true);
      setTimeout(() => {
        resetAll();
        setActiveTab("home");
      }, 15000);
    } catch (err) {
      setSubmitMessage("Error submitting RSVP: " + (err.message || "Unknown"));
      setSubmitSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyRSVP = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(""); setVerifyResult({ rsvps: [] }); setUpdateMessage(null); setUpdateError(null);
    if (!verifyConfNumber.trim()) return setError("Confirmation number is required.");
    setVerifying(true);
    try {
      const data = await verifyRSVP(verifyConfNumber.trim());
      setVerifyResult(Array.isArray(data.rsvps) ? data : { rsvps: [] });
    } catch (err) {
      setError(err.response?.status === 404 ? "Confirmation number not found." : err.message || "Error verifying RSVP.");
    } finally {
      setVerifying(false);
    }
  };

  const handleUpdateRSVP = async (e, updatedRSVP) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!updatedRSVP || !updatedRSVP.eventname) return setUpdateError("Invalid update payload.");
    setSubmitting(true); setUpdateMessage(null); setUpdateError(null);
    try {
      await updateRSVP(updatedRSVP);
      setUpdateMessage("RSVP updated successfully.");
      handleVerifyRSVP();
    } catch (err) {
      setUpdateError(err.message || "Error updating RSVP.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayDate = (d) => {
    if (!d) return "";
    // If date is YYYY-MM-DD convert; otherwise let Date parse
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [y, m, day] = d.split("-");
      return `${m}/${day}/${y}`;
    }
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="page-wrapper">
      <div className="home-container">
        {/* header */}
        <div className="home-header">
          <div className="logo-wrapper">
            <img src={logo} alt="JSMC Logo" className="rsvp-logo" />
          </div>
          <div className="titles">
            <h2>JSMC RSVP Portal</h2>
            {activeTab === "home" && <h3>Current open events to Submit / Verify / Modify RSVP</h3>}
          </div>
        </div>

        {/* tabs */}
        <nav className="tab-header">
          {activeTab !== "home" && (
            <button className="tab" onClick={() => handleTabChange("home")}>Home</button>
          )}
          {Array.isArray(events) && events.length > 0 && (
            <>
              {activeTab !== "submit" && <button className="tab" onClick={() => handleTabChange("submit")}>Submit RSVP</button>}
              {activeTab !== "verify" && <button className="tab" onClick={() => handleTabChange("verify")}>Verify / Modify RSVP</button>}
            </>
          )}
        </nav>

        {/* HOME - uses cards/grid (no table) */}
        {activeTab === "home" && (
          <section className="home-tab">
            <div className="open-events-title">Open Events</div>

            <div className="events-area">
              {loadingEvents ? (
                <div className="loading">Loading events...</div>
              ) : Array.isArray(events) && events.length > 0 ? (
                <div className="events-grid">
                  {events.map((ev, idx) => {
                    const isFirst = idx === 0 || ev.programname !== events[idx - 1].programname;
                    return (
                      <article className="event-card" key={ev._id || idx}>
                        <div className="event-card-row">
                          <div className="event-card-left">
                            {isFirst ? <div className="event-program">{ev.programname}</div> : <div className="event-program-spacer" />}
                          </div>
                          <div className="event-card-right">
                            <div className="event-name">{ev.eventname}</div>
                            <div className="event-date">{ev.eventday}, {displayDate(ev.eventdate)}</div>
                            <div className="event-rsvpby">RSVP By: {displayDate(ev.closersvp)}</div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="no-events">No open events available for RSVP at this time.</div>
              )}
            </div>

            {Array.isArray(events) && events.length > 0 && <h4 className="select-action">Please select Submit RSVP or Verify/Modify RSVP</h4>}
          </section>
        )}

        {/* SUBMIT */}
        {activeTab === "submit" && (
          <section className="submit-tab">
            {isLifeMember === null && (
              <div className="form-section">
                <h3>Are you JSMC Life Member?</h3>
                <div className="radio-group">
                  <label><input type="radio" name="lifeMember" value="yes" onChange={() => setIsLifeMember("yes")} /> Yes</label>
                  <label><input type="radio" name="lifeMember" value="no" onChange={() => setIsLifeMember("no")} /> No</label>
                </div>
              </div>
            )}

            {isLifeMember === "no" && (
              <NonMemberRSVP
                events={events}
                displayDate={displayDate}
                toggleEventSelection={toggleEventSelection}
                selectedEvents={selectedEvents}
                rsvpCount={rsvpCount}
                setRsvpCount={setRsvpCount}
                kidsRsvpCount={kidsRsvpCount}
                setKidsRsvpCount={setKidsRsvpCount}
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

            {isLifeMember === "yes" && !member && (
              <form className="search-form" onSubmit={handleSearch}>
                <h4>Retrieve membership using</h4>
                <div className="radio-group">
                  <label><input type="radio" value="memberId" checked={searchMode === "memberId"} onChange={() => setSearchMode("memberId")} /> Member ID</label>
                  <label>OR</label>
                  <label><input type="radio" value="nameHouse" checked={searchMode === "nameHouse"} onChange={() => setSearchMode("nameHouse")} /> First Name &amp; House #</label>
                </div>

                {searchMode === "memberId" && (
                  <div className="inline-fields">
                    <label className="inline-label">Member ID:</label>
                    <input ref={memberIdRef} className="small-input" type="number" value={memberId} onChange={(e) => setMemberId(e.target.value)} placeholder="Enter Member ID" />
                    <button className="button" type="submit" disabled={searching || memberId.trim() === ""}>{searching ? "Searching..." : "Search"}</button>
                  </div>
                )}

                {searchMode === "nameHouse" && (
                  <div className="inline-fields">
                    <label className="inline-label">First Name:</label>
                    <input ref={firstNameRef} className="small-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="First Name" />
                    <label className="inline-label">House #:</label>
                    <input className="small-input" type="text" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} placeholder="e.g. 123" />
                    <button className="button" type="submit" disabled={searching || name.trim() === "" || houseNumber.trim() === ""}>{searching ? "Searching..." : "Search"}</button>
                  </div>
                )}
              </form>
            )}

            {member && (
              <MemberRSVP
                events={events}
                displayDate={displayDate}
                toggleEventSelection={toggleEventSelection}
                selectedEvents={selectedEvents}
                rsvpCount={rsvpCount}
                setRsvpCount={setRsvpCount}
                kidsRsvpCount={kidsRsvpCount}
                setKidsRsvpCount={setKidsRsvpCount}
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

            {submitMessage && (
              <div className={`message ${submitSuccess ? "success" : "error"}`}>
                {submitSuccess ? "✅ " : "❌ "}{submitMessage}
                {confirmation && submitSuccess && <div>Confirmation #: {confirmation.confNumber || confirmation?.confNumber}</div>}
              </div>
            )}
          </section>
        )}

        {/* VERIFY */}
        {activeTab === "verify" && (
          <section className="verify-tab">
            <VerifyRSVP />
          </section>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}
