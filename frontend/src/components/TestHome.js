import React from "react";
import "../styles/TestHome.css";
import logo from "../assets/JSMCLogo.jpg";

const TestHome = () => {
  return (
    <div className="home-container">
      <div className="home-card">
        <img src={logo} alt="JSMC Logo" className="home-logo" />
        <h1 className="home-title">JSMC RSVP Portal</h1>
        <h2 className="home-subtitle">
          Current open events to Submit / Verify / Modify RSVP
        </h2>
        <div className="button-group">
          <button className="rsvp-button">Submit RSVP</button>
          <button className="rsvp-button">Verify / Modify RSVP</button>
        </div>
        <div className="event-section">
          <p className="event-title">Open Events</p>
          <p>Pathshala</p>
          <p>Afternoon Swamivatsalya</p>
          <p>Sunday, 11/02/2025</p>
          <p>RSVP By: 11/01/2025</p>
          <p className="event-note">
            Please select Submit RSVP or Verify/Modify RSVP
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestHome;
