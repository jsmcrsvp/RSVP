import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/SubmitForm.css";

function SubmitForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordChange, setPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const SERVER_URL = process.env.REACT_APP_BACKEND_SERVER_URL;

  useEffect(() => {
    setError("");
  }, [passwordChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${SERVER_URL}/login`, { email, password });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("name", response.data.name);

        //console.log("✅ Login Successful! Role:", response.data.role);
        navigate("/data");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setPasswordChange(true);
        setError("Password change required. Please update your password.");
      } else {
        setError(err.response?.data?.message || "Invalid email or password.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  //===============================================================================================
  const handlePasswordChangeSubmit = async (e) => {
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
  };

  return (
    <div className="login-container">
      <div className="top-half">
        <h2>JSG Volleyball</h2>
        <h3>Login</h3>
      </div>
      <div className="input-half">
        {error && <p className="error-message">{error}</p>}
        {!passwordChange ? (
          <form>
            <div className="form-group">
              <label>Email Address:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Logging..." : "Login"}
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