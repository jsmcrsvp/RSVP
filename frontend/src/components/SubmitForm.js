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

  useEffect(() => {
    setError("");
  }, [passwordChange]);

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
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("name", response.data.name);

        //console.log("✅ Login Successful! Role:", response.data.role);
        navigate("/data");
      }
    } catch (err) {
      if (err.response?.status === 403) {
      } else {
        setError(err.response?.data?.message || "Invalid email or password.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  //===============================================================================================
  /*const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    try {
      await axios.post(`${SERVER_URL}/change-password`, { email, newPassword });

      alert("Password changed successfully. Please log in again.");
      setPasswordChange(false);
      setPassword("");
      setNewPassword("");
    } catch (err) {
      setError("Failed to change password. Please try again.");
    }
  };*/

  return (
    <div className="login-container">
      <div className="top-half">
        <h2>JSMC RSVP</h2>
        <h3>Submit RSVP</h3>
      </div>
      <div className="input-half">
        {error && <p className="error-message">{error}</p>}
        {!passwordChange ? (
          <form>
            <div className="form-group">
              <label>Member ID:</label>
              <input type="number" value={member_id} onChange={(e) => setMember_Id(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
            </button>
          </form>
        ) : (
          <form>
            <div className="form-group">
              <label>New Password:</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <button className="button" onClick={handlePasswordChangeSubmit} disabled={isLoading}>
            {isLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default SubmitForm;