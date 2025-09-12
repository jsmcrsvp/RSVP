// frontend/src/components/SubmitRSVP/SubmitRSVPLanding.js
import React, { useState } from "react";
import MemberRSVP from "./MemberRSVP";
import NonMemberRSVP from "./NonMemberRSVP";

export default function SubmitRSVPLanding({ events, onHome }) {
  const [isLifeMember, setIsLifeMember] = useState(null);

  return (
    <div className="submit-landing">
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
        <MemberRSVP events={events} onHome={onHome} />
      )}
      {isLifeMember === "no" && (
        <NonMemberRSVP events={events} onHome={onHome} />
      )}
    </div>
  );
}
