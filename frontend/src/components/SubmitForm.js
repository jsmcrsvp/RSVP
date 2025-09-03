import React, { useState } from "react";
import { searchMember } from "../api";
import "../styles/SubmitForm.css";

function SubmitForm() {
  const [searchType, setSearchType] = useState("id"); // "id" or "name"
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      setIsLoading(true);
      let payload = {};

      if (searchType === "id") {
        if (!memberId) return setError("Member ID is required.");
        payload = { memberId };
      } else {
        if (!name || !houseNumber) return setError("Name and House Number are required.");
        payload = { name, houseNumber };
      }

      console.log("✅ Searching:", payload);
      const data = await searchMember(payload);

      setResult(data);
      localStorage.setItem("name", data.name);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="top-half">
        <h2>JSMC RSVP</h2>
        <h3>Submit RSVP</h3>
      </div>

      <div className="input-half">
        {/* Error */}
        {error && <p className="error-message">{error}</p>}

        {/* Search Options */}
        <div className="form-group">
          <label>
            <input
              type="radio"
              value="id"
              checked={searchType === "id"}
              onChange={() => setSearchType("id")}
            />
            Search by Member ID
          </label>
          <label style={{ marginLeft: "1rem" }}>
            <input
              type="radio"
              value="name"
              checked={searchType === "name"}
              onChange={() => setSearchType("name")}
            />
            Search by Name + House Number
          </label>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {searchType === "id" && (
            <div className="form-group">
              <label>Member ID:</label>
              <input
                type="number"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {searchType === "name" && (
            <>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>House Number:</label>
                <input
                  type="text"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                />
              </div>
            </>
          )}

          <button className="button" type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Result Table */}
        {result && (
        <div className="table-wrapper">
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
                <td data-label="Name">{result.name}</td>
                <td data-label="Address">{result.address}</td>
                <td data-label="Phone">{result.phone}</td>
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

/*
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchMember } from "../api";
import "../styles/SubmitForm.css";

function SubmitForm() {
  const [memberId, setMemberId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!memberId) {
      setError("Member ID is required.");
      return;
    }

    try {
      setIsLoading(true);
      console.log("✅ Member Search:", memberId);
      const data = await searchMember(memberId);

      // save info locally if needed
      localStorage.setItem("name", data.name);
      console.log("✅ Member found:", data);

      // optionally navigate
      // navigate("/somepage");

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="top-half">
        <h2>JSMC RSVP</h2>
        <h3>Submit RSVP</h3>
      </div>
      <div className="input-half">
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Member ID:</label>
            <input
              type="number"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
              autoFocus
            />
          </div>
          <button className="button" type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SubmitForm;
*/