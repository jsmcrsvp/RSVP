import React, { useEffect, useState } from "react";
import { getAllPrograms, getOpenEvents, getClosedEvents, getRsvpReports } from "../api";
import "../styles/Dashboard.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function AdminEventReport() {
  const [programs, setPrograms] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [memberDetails, setMemberDetails] = useState([]);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Fetch programs
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await getAllPrograms();
        setPrograms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching programs:", err);
        setError("Failed to load programs.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  // Fetch events when a program is selected
  useEffect(() => {
    if (!selectedProgram) {
      setEvents([]);
      setSelectedEvent("");
      return;
    }

    const fetchEvents = async () => {
      try {
        setError("");
        const [openData, closedData] = await Promise.all([
          getOpenEvents(),
          getClosedEvents(),
        ]);
        const filteredEvents = [...openData, ...closedData].filter(
          (ev) => ev.programname === selectedProgram
        );
        setEvents(filteredEvents);
        setSelectedEvent("");
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events for the selected program.");
      }
    };

    fetchEvents();
  }, [selectedProgram]);

  // Generate report
  const generateReport = async () => {
    if (!selectedProgram || !selectedEvent) return;

    setReportGenerated(true);
    setReportLoading(true);
    setMemberDetails([]);
    setError("");

    try {
      //const detailRes = await getRsvpDetails(selectedProgram, selectedEvent);
      const detailRes = await getRsvpReports(selectedProgram, selectedEvent);
      setMemberDetails(Array.isArray(detailRes) ? detailRes : []);
    } catch (err) {
      console.error("Error fetching report:", err);
      setError("Failed to fetch RSVP report data.");
      setMemberDetails([]);
    } finally {
      setReportLoading(false);
    }
  };

  // Download Excel
  const downloadExcel = () => {
    if (!memberDetails || memberDetails.length === 0) return;

    const worksheetData = memberDetails.map((item) => ({
      "Member Name": item.memname,
      "Phone Number": item.memphonenumber,
      "Adult RSVP": item.rsvpcount,
      "Kids RSVP": item.kidsrsvpcount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RSVP");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${selectedProgram}_${selectedEvent}_RSVP.xlsx`);
  };

  return (
    <div className="dashboard-container">
      {loading ? (
        <p>Loading programs...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          {/* Program Selection */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="programSelect">Program:</label>
            <select
              id="programSelect"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              style={{ marginLeft: "0.5rem" }}
            >
              <option value="">-- Select Program --</option>
              {programs.map((p, idx) => (
                <option key={idx} value={p.progname}>
                  {p.progname}
                </option>
              ))}
            </select>
          </div>

          {/* Event Selection */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="eventSelect">Event:</label>
            <select
              id="eventSelect"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              style={{ marginLeft: "0.5rem" }}
              disabled={events.length === 0}
            >
              <option value="">-- Select Event --</option>
              {events.map((ev, idx) => (
                <option key={idx} value={ev.eventname}>
                  {ev.eventname}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Report and Download Buttons */}
          <div style={{ marginBottom: "1rem" }}>
            <button
              onClick={generateReport}
              disabled={!selectedProgram || !selectedEvent || reportLoading}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: !selectedProgram || !selectedEvent ? "grey" : "#007bff",
                color: "white",
                cursor: !selectedProgram || !selectedEvent ? "not-allowed" : "pointer",
                marginRight: "1rem",
              }}
            >
              {reportLoading ? "Generating..." : "Generate Report"}
            </button>

            {memberDetails.length > 0 && (
              <button
                onClick={downloadExcel}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Download Excel
              </button>
            )}
          </div>

          {/* Report Table */}
          {memberDetails.length > 0 && (
            <div style={{ overflowX: "auto", marginTop: "2rem" }}>
              <h4>Member RSVP Details</h4>
              <div className="result-table-wrapper">
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>Member Name</th>
                      <th>Phone Number</th>
                      <th>Adult RSVP</th>
                      <th>Kids RSVP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberDetails.map((rsvp, idx) => (
                      <tr key={idx}>
                        <td>{rsvp.memname}</td>
                        <td>{rsvp.memphonenumber}</td>
                        <td>{rsvp.rsvpcount}</td>
                        <td>{rsvp.kidsrsvpcount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Data Message only after Generate clicked */}
          {reportGenerated && memberDetails.length === 0 && !reportLoading && (
            <p>No RSVP report exists for the selected event.</p>
          )}
        </>
      )}
    </div>
  );
}