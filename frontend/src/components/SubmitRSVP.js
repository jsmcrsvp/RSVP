// frontend/src/components/SubmitRSVP.js
import React, { useState } from "react";
import MemberRSVP from "./SubmitRSVP/MemberRSVP";
import NonMemberRSVP from "./SubmitRSVP/NonMemberRSVP";
import "../styles/SubmitRSVP.css";

export default function SubmitRSVP({ events = [], onHome }) {
  const [isLifeMember, setIsLifeMember] = useState(null);

  // Member-only state
  const [member, setMember] = useState(null);
  const [email, setEmail] = useState("");

  // Non-member state
  const [nonMemberName, setNonMemberName] = useState("");
  const [nonMemberAddress, setNonMemberAddress] = useState("");
  const [nonMemberPhone, setNonMemberPhone] = useState("");
  const [nonMemberEmail, setNonMemberEmail] = useState("");

  // RSVP state
  const [selectedEvents, setSelectedEvents] = useState({});
  const [rsvpCount, setRsvpCount] = useState(0);

  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const displayDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
  };

  const toggleEventSelection = (idx, checked) => {
    setSelectedEvents((prev) => {
      const newSel = { ...prev };
      if (checked) newSel[idx] = true;
      else delete newSel[idx];
      return newSel;
    });
  };

  const generateConfNumber = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const handleSubmitRSVP = async (e) => {
    e.preventDefault();
    setSubmitMessage(null);
    setSubmitSuccess(false);

    if (!Object.keys(selectedEvents).length) {
      setSubmitMessage("Please select at least one event.");
      return;
    }

    // Choose which info to send
    const memname = isLifeMember === "yes" ? member?.name : nonMemberName;
    const memaddress =
      isLifeMember === "yes" ? member?.address : nonMemberAddress;
    const memphonenumber =
      isLifeMember === "yes" ? member?.phone : nonMemberPhone;
    const mememail = isLifeMember === "yes" ? email : nonMemberEmail;

    if (!memname || !memaddress || !memphonenumber || !mememail) {
      setSubmitMessage("Please fill in all required fields.");
      return;
    }

    const payload = {
      memname,
      memaddress,
      memphonenumber,
      mememail,
      rsvpconfnumber: generateConfNumber(),
      events: events
        .map((ev, idx) =>
          selectedEvents[idx]
            ? {
                programname: ev.programname,
                eventname: ev.eventname,
                eventday: ev.eventday,
                eventdate: ev.eventdate,
                rsvpcount: rsvpCount,
              }
            : null
        )
        .filter(Boolean),
    };

    setSubmitting(true);
    try {
      const res = await fetch("/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "RSVP failed");

      setSubmitMessage("✅ RSVP submitted successfully!");
      setSubmitSuccess(true);

      // reset after success
      setTimeout(() => {
        setIsLifeMember(null);
        setMember(null);
        setEmail("");
        setNonMemberName("");
        setNonMemberAddress("");
        setNonMemberPhone("");
        setNonMemberEmail("");
        setSelectedEvents({});
        setRsvpCount(0);
        onHome && onHome();
      }, 8000);
    } catch (err) {
      setSubmitMessage("❌ " + (err.message || "Unknown error"));
      setSubmitSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rsvp-container">
      {isLifeMember === null && (
        <div className="form-section">
          <h3>Are you JSMC Life Member?</h3>
          <label>
            <input
              type="radio"
              name="lifeMember"
              value="yes"
              onChange={() => setIsLifeMember("yes")}
            />{" "}
            Yes
          </label>
          <label style={{ marginLeft: "1rem" }}>
            <input
              type="radio"
              name="lifeMember"
              value="no"
              onChange={() => setIsLifeMember("no")}
            />{" "}
            No
          </label>
        </div>
      )}

      {isLifeMember === "yes" && (
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
          submitMessage={submitMessage}
          submitSuccess={submitSuccess}
        />
      )}
    </div>
  );
}
