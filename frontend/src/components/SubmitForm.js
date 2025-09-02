import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchMember } from "../api";
import "../styles/SubmitForm.css";

function SubmitForm() {
  const [member_id, setMember_Id] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!member_id) {
      setError("Member ID is required.");
      return;
    }

    try {
      setIsLoading(true);
      const data = await searchMember(member_id);

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
              value={member_id}
              onChange={(e) => setMember_Id(e.target.value)}
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

/*
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/SubmitForm.css";

function SubmitForm() {
  const [member_id, setMember_Id] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const SERVER_URL = process.env.REACT_APP_BACKEND_SERVER_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!member_id) {
      setError("Member ID is required.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${SERVER_URL}/search_member`, { member_id });

      if (response.data.token) {
        localStorage.setItem("name", response.data.name);

        //console.log("✅ Login Successful! Role:", response.data.role);
        //navigate("/data");
      }
    } catch (err) {
      if (err.response?.status === 403) {
      } else {
        setError(err.response?.data?.message || "Invalid Member ID.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  //===============================================================================================

  return (
    <div className="login-container">
      <div className="top-half">
        <h2>JSMC RSVP</h2>
        <h3>Submit RSVP</h3>
      </div>
      <div className="input-half">
        {error && <p className="error-message">{error}</p>}
          <form>
            <div className="form-group">
              <label>Member ID:</label>
              <input type="number" value={member_id} onChange={(e) => setMember_Id(e.target.value)} required autoFocus />
            </div>
            <button className="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
            </button>
          </form>
      </div>
    </div>
  );
}

export default SubmitForm;
*/