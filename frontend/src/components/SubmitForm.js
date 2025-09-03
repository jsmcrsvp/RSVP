import React, { useState } from "react";
import { searchMember } from "../api";
import "../styles/SubmitForm.css";

function SubmitForm() {
  const [searchMode, setSearchMode] = useState("memberId");
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      setIsLoading(true);
      const payload =
        searchMode === "memberId" ? { memberId } : { name, houseNumber };
      const data = await searchMember(payload);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="search-container">
        <h2>JSMC RSVP</h2>
        <h3>Search Member</h3>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="search-form">
          {/* Search by Member ID */}
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
                className="small-input"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="Enter Member ID"
                required
              />
            )}
          </div>

          {/* Search by Name + House No */}
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
                  className="small-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  required
                />
                <input
                  type="text"
                  className="small-input"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="House #"
                  required
                />
              </div>
            )}
          </div>

          <button type="submit" className="button" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Results Table */}
        {result && (
          <div className="result-table-wrapper">
            <table className="result-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="nowrap">{result.name}</td>
                  <td>{result.address}</td>
                  <td className="nowrap">{result.phone}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubmitForm;
