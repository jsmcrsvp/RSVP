// frontend/src/components/SubmitRSVP.js ======= Submit Working 090425 ====10:00pm =====
import React, { useEffect, useState } from "react";
import { getOpenEvents, searchMember, submitRSVP, verifyRSVP } from "../api";
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
    } catch (err) {
      setError(err.message || "Error submitting RSVP.");
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
      // backend returns { message, rsvps: [...] }

      console.log("✅ RSVP verification response:", data);

      if (Array.isArray(data.rsvps) && data.rsvps.length > 0) {
        console.log(`✅ Loaded ${data.rsvps.length} RSVP record(s).`);
      } else {
        console.warn("⚠️ No RSVP records found or rsvps is not an array.");
      }

      setVerifyResult(data.rsvps || []);
    } catch (err) {
      console.error("❌ Error verifying RSVP:", err);
      setError(err.response?.data?.message || err.message || "Error verifying RSVP.");
    } finally {
      setVerifying(false);
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
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Event</th>
                      <th>Date</th>
                      <th>RSVP Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifyResult.rsvps?.map((ev, idx) => {
                      console.log("RSVP row:", ev);
                      return (
                        <tr key={idx}>
                          <td>{ev.programname}</td>
                          <td>{ev.eventname}</td>
                          <td>{ev.eventday}, {ev.eventdate}</td>
                          <td>{ev.rsvpcount}</td>
                        </tr>
                      );
                    })}
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




/* frontend/src/components/SubmitRSVP.js ======= Submit Working 090425 ====10:00pm =====
import React, { useEffect, useState } from "react";
import { getOpenEvents, searchMember, submitRSVP } from "../api";
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
    } catch (err) {
      setError(err.message || "Error submitting RSVP.");
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
      const data = await verifyRSVP(verifyConfNumber);
      setVerifyResult(data);
    } catch (err) {
          setError(err.message || "Error verifying RSVP.");
    } finally {
          setVerifying(false);
      }
  };

  // -------- UI --------
  return (
    <div className="page-wrapper">
      <div className="rsvp-container">
        <h2>JSMC RSVP</h2>

        {/* Tabs
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
        
        {/* ----- TAB: Home ----- 
        {activeTab === "home" && (
          <>
          <form className="home">
            <h3>Welcome to JSMC RSVP Portal</h3>
            <h4>Please select Submit RSVP or Verify / Modify RSVP</h4>
          </form>
          </>
        )}

        {/* ----- TAB: Submit RSVP ----- 
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

        {/* ----- TAB: Verify RSVP -----
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
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Event</th>
                      <th>Date</th>
                      <th>RSVP Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifyResult.events?.map((ev, idx) => (
                      <tr key={idx}>
                        <td>{ev.programname}</td>
                        <td>{ev.eventname}</td>
                        <td>
                          {ev.eventday}, {ev.eventdate}
                        </td>
                        <td>{ev.rsvpcount}</td>
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
*/


/* frontend/src/components/SubmitRSVP.js ======= Working 090425 - 8:00am =======
// frontend/src/components/SubmitRSVP.js
import React, { useEffect, useState } from "react";
import { getOpenEvents, searchMember, submitRSVP } from "../api";
import "../styles/SubmitRSVP.css";

export default function SubmitRSVP() {
  // Step control
  const [isLifeMember, setIsLifeMember] = useState(null); // "yes" | "no"
  const [searchMode, setSearchMode] = useState(""); // "memberId" | "nameHouse"

  // Event state
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState({}); // {eventId: rsvpCount}

  // Search state
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [member, setMember] = useState(null);

  // UI state
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null); // store response after submit

  const [email, setEmail] = useState("");

  // Load open events
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

  // Member search handler
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

  // Event selection toggle
  const toggleEventSelection = (eventId, checked) => {
    setSelectedEvents((prev) => {
      const copy = { ...prev };
      if (checked) {
        copy[eventId] = 1; // default count 1
      } else {
        delete copy[eventId];
      }
      return copy;
    });
  };

  // RSVP count update
  const updateEventCount = (eventId, value) => {
    setSelectedEvents((prev) => ({
      ...prev,
      [eventId]: value ? parseInt(value, 10) : 0,
    }));
  };

  // RSVP submit handler
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
        .filter((ev, idx) => selectedEvents[idx] !== undefined)
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
      // Reset selections
      setSelectedEvents({});
    } catch (err) {
      setError(err.message || "Error submitting RSVP.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="rsvp-container">
        <h2>Welcome to JSMC RSVP Portal</h2>
        {error && <div className="error-message">{error}</div>}

        {/* Step 1: Life Member Question
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

        {/* If No, stop
        {isLifeMember === "no" && (
          <div className="message">Thank you. RSVP is only for Life Members.</div>
        )}

        {/* Step 2: Member Search
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
                <button className="button" type="submit" disabled={searching}>
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
                <button className="button" type="submit" disabled={searching}>
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>
            )}
          </form>
        )}

        {/* Step 3: Membership Details + Event Selection
        {member && (
          <form className="rsvp-form" onSubmit={handleSubmitRSVP}>
            {/*<h4>Membership Details</h4>
            <div className="result-table-wrapper" style={{ marginTop: "0.5rem" }}>
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

            {/*<h4 style={{ marginTop: "1rem" }}>Select Events</h4>
            <div className="result-table-wrapper"style={{ marginTop: "0.5rem" }}>
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
              <button className="button" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit RSVP"}
              </button>
            )}
            </div>
          </form>
        )}

        {/* Step 4: Confirmation Table
        {confirmation && (
          <div className="result-table-wrapper">
            <h4>RSVP Confirmation</h4>
            <table className="result-table">
              <tbody>
                <tr>
                  <th>Confirmation #</th>
                  <td>{confirmation.confNumber}</td>
                </tr>
                {/*<tr>
                  <th>Name</th>
                  <td>{member?.name}</td>
                </tr>
                <tr>
                  <th>Phone</th>
                  <td>{member?.phone}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
*/


/* frontend/src/components/SubmitRSVP.js ======= Working 090425 - 10:00am =======
import React, { useEffect, useMemo, useState } from "react";
import { getOpenEvents, searchMember, submitRSVP } from "../api";
import "../styles/SubmitRSVP.css";

export default function SubmitRSVP() {
  const [events, setEvents] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [searchMode, setSearchMode] = useState("memberId");
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");

  const [member, setMember] = useState(null);
  const [rsvpCount, setRsvpCount] = useState(1);
  const [confNumber, setConfNumber] = useState("");

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [lastRSVP, setLastRSVP] = useState(null); // store last submitted RSVP for confirmation table

  const selectedEvent = useMemo(
    () => (selectedIndex >= 0 ? events[selectedIndex] : null),
    [events, selectedIndex]
  );

  useEffect(() => {
    (async () => {
      setLoadingEvents(true);
      setError("");
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

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
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

  const handleSubmitRSVP = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!selectedEvent) {
      setError("Please select an event.");
      return;
    }
    if (!member) {
      setError("Please search and select a member first.");
      return;
    }

    // generate confirmation number upon submit
    const conf = Math.floor(100000 + Math.random() * 900000).toString();
    setConfNumber(conf);

    const payload = {
      eventdate: selectedEvent.eventdate,
      eventday: selectedEvent.eventday,
      memname: member.name,
      memaddress: member.address,
      memphonenumber: member.phone,
      rsvpcount: Number(rsvpCount) || 1,
      rsvpconfnumber: conf,
      eventname: selectedEvent.eventname,
      programname: selectedEvent.programname,
    };

    setSubmitting(true);
    try {
      await submitRSVP(payload);
      setLastRSVP(payload); // store for confirmation table
      setMessage("RSVP submitted successfully!");
      // reset member search & RSVP fields
      setMember(null);
      setMemberId("");
      setName("");
      setHouseNumber("");
      setRsvpCount(1);
      setConfNumber(""); // will regenerate on next submission
    } catch (err) {
      setError(err.message || "Error submitting RSVP.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="rsvp-container">
        <h2>Welcome to JSMC RSVP Portal</h2>

        {message && <div className="message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {/* Event selection }
        <div className="form-section">
          <h3>Select an available event to RSVP</h3>
          <select
            value={selectedIndex}
            onChange={(e) => {
              setSelectedIndex(Number(e.target.value));
              setMember(null);
              setMessage("");
              setError("");
            }}
            disabled={loadingEvents}
          >
            <option value={-1} disabled>
              {loadingEvents ? "Loading available events..." : "Select an Event"}
            </option>
            {events.map((ev, idx) => (
              <option key={`${ev.programname}-${ev.eventname}-${idx}`} value={idx}>
                {ev.programname} — {ev.eventname} ({ev.eventday}, {ev.eventdate})
              </option>
            ))}
          </select>
        </div>

        {/* Member search }
        <form className="search-form" onSubmit={handleSearch}>
          <h4>Retrieve member by entering Member ID or First Name & House #</h4>

          <div className="form-row">
            <label className="radio-label">
              <input
                type="radio"
                value="memberId"
                checked={searchMode === "memberId"}
                onChange={() => setSearchMode("memberId")}
              />
              Member ID
            </label>

            <label className="radio-label">
              <input
                type="radio"
                value="nameHouse"
                checked={searchMode === "nameHouse"}
                onChange={() => setSearchMode("nameHouse")}
              />
              First Name & House #
            </label>
          </div>

          {searchMode === "memberId" ? (
            <div className="inline-fields">
              <input
                className="small-input"
                type="number"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="Enter Member ID"
                required
              />
              <button className="button" type="submit" disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </button>
            </div>
          ) : (
            <div className="inline-fields">
              <input
                className="small-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
              />
              <span className="inline-label">House #</span>
              <input
                className="small-input"
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="e.g. 123"
                required
              />
              <button className="button" type="submit" disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </button>
            </div>
          )}
        </form>

        {/* Member result + RSVP }
{member && (
  <form className="rsvp-form" onSubmit={handleSubmitRSVP}>
    <h4>Membership Details</h4>

    <div className="last-rsvp">
      <table>
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

    <div className="form-row" style={{ marginTop: "0.5rem" }}>
      <label className="inline-label">RSVP Count</label>
      <input
        className="small-input rsvp-count-input"
        type="number"
        min="1"
        max="99"
        value={rsvpCount}
        onChange={(e) => setRsvpCount(e.target.value)}
        required
      />

      <button className="button" type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit RSVP"}
      </button>
    </div>
  </form>
)}


        {/* RSVP Confirmation Table }
        {lastRSVP && (
          <div className="last-rsvp">
            <h4>RSVP Confirmation</h4>
            <table>
              <tbody>
                <tr>
                  <th>Member</th>
                  <td>{lastRSVP.memname}</td>
                </tr>
                <tr>
                  <th>Address</th>
                  <td>{lastRSVP.memaddress}</td>
                </tr>
                <tr>
                  <th>Phone</th>
                  <td>{lastRSVP.memphonenumber}</td>
                </tr>
                <tr>
                  <th>Event</th>
                  <td>{lastRSVP.eventname} — {lastRSVP.programname}</td>
                </tr>
                <tr>
                  <th>Event Date</th>
                  <td>{lastRSVP.eventday}, {lastRSVP.eventdate}</td>
                </tr>
                <tr>
                  <th>RSVP Count</th>
                  <td>{lastRSVP.rsvpcount}</td>
                </tr>
                <tr>
                  <th>Conf #</th>
                  <td>{lastRSVP.rsvpconfnumber}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


{/* frontend/src/components/SubmitRSVP.js ======= Working 090425 - 10:00am =======*/

/*import React, { useState, useEffect } from "react";
import { searchMember, getOpenEvents, submitRSVP } from "../api";
import "../styles/SubmitRSVP.css";

function SubmitRSVP() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchMode, setSearchMode] = useState("memberId");
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [member, setMember] = useState(null);
  const [rsvpCount, setRsvpCount] = useState("");
  const [confNumber, setConfNumber] = useState("");
  const [message, setMessage] = useState("");
  const [lastRSVP, setLastRSVP] = useState(null); // store last submitted RSVP

  useEffect(() => {
    async function fetchEvents() {
      const openEvents = await getOpenEvents();
      setEvents(openEvents);
    }
    fetchEvents();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage("");
    setMember(null);
    try {
      const payload =
        searchMode === "memberId"
          ? { memberId }
          : { name, houseNumber };
      const data = await searchMember(payload);
      setMember(data);
    } catch (err) {
      setMessage(err.message || "Member not found");
    }
  };

  const handleRSVP = async (e) => {
    e.preventDefault();
    setMessage("");
    const conf = Math.floor(100000 + Math.random() * 900000).toString();
    setConfNumber(conf);

    const payload = {
      eventdate: selectedEvent.eventdate,
      eventday: selectedEvent.eventday,
      programname: selectedEvent.programname,
      eventname: selectedEvent.eventname,
      memname: member.name,
      memaddress: member.address,
      memphonenumber: member.phone,
      rsvpcount: rsvpCount,
      rsvpconfnumber: conf,
    };

    try {
      await submitRSVP(payload);
      setMessage(`✅ RSVP submitted! Confirmation #: ${conf}`);
      setLastRSVP(payload); // save last RSVP to display

      // Reset search and RSVP fields
      setMember(null);
      setMemberId("");
      setName("");
      setHouseNumber("");
      setRsvpCount("");
      setSelectedEvent(null);
    } catch (err) {
      setMessage(err.message || "❌ Failed to submit RSVP");
    }
  };

  return (
    <div className="rsvp-container">
      <h2>Submit RSVP</h2>
      {message && <p className="message">{message}</p>}

      <div className="form-section">
        <label>Open Event:</label>
        <select
          value={selectedEvent ? selectedEvent.eventname : ""}
          onChange={(e) =>
            setSelectedEvent(events.find((ev) => ev.eventname === e.target.value))
          }
        >
          <option value="">-- Select Event --</option>
          {events.map((ev, idx) => (
            <option key={idx} value={ev.eventname}>
              {ev.programname} - {ev.eventname} ({ev.eventdate})
            </option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <>
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-row">
              <label className="radio-label">
                <input
                  type="radio"
                  value="memberId"
                  checked={searchMode === "memberId"}
                  onChange={() => setSearchMode("memberId")}
                />
                Member ID
              </label>
              {searchMode === "memberId" && (
                <input
                  type="number"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="Enter Member ID"
                  required
                />
              )}
            </div>

            <div className="form-row">
              <label className="radio-label">
                <input
                  type="radio"
                  value="nameHouse"
                  checked={searchMode === "nameHouse"}
                  onChange={() => setSearchMode("nameHouse")}
                />
                Name
              </label>
              {searchMode === "nameHouse" && (
                <div className="inline-fields">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    required
                  />
                  <label> & House # </label>
                  <input
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="House #"
                    required
                  />
                </div>
              )}
            </div>
            <button type="submit">Search Member</button>
          </form>
        </>
      )}

      {member && (
        <form onSubmit={handleRSVP} className="rsvp-form">
          <p>
            Member: {member.name}, {member.address}, {member.phone}
          </p>
          <input
            type="number"
            value={rsvpCount}
            onChange={(e) => setRsvpCount(e.target.value)}
            placeholder="RSVP Count"
            required
          />
          <button type="submit">Submit RSVP</button>
        </form>
      )}

      {/* Last submitted RSVP table }
      {lastRSVP && (
        <div className="last-rsvp">
          <h3>Last Submitted RSVP</h3>
          <table>
            <tbody>
              <tr>
                <th>Program</th>
                <td>{lastRSVP.programname}</td>
              </tr>
              <tr>
                <th>Event</th>
                <td>{lastRSVP.eventname}</td>
              </tr>
              <tr>
                <th>Date</th>
                <td>{lastRSVP.eventdate}</td>
              </tr>
              <tr>
                <th>Day</th>
                <td>{lastRSVP.eventday}</td>
              </tr>
              <tr>
                <th>Member Name</th>
                <td>{lastRSVP.memname}</td>
              </tr>
              <tr>
                <th>Address</th>
                <td>{lastRSVP.memaddress}</td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>{lastRSVP.memphonenumber}</td>
              </tr>
              <tr>
                <th>RSVP Count</th>
                <td>{lastRSVP.rsvpcount}</td>
              </tr>
              <tr>
                <th>Confirmation #</th>
                <td>{lastRSVP.rsvpconfnumber}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SubmitRSVP;
*/