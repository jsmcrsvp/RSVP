// frontend/src/components/RSVPPage.js
import React, { useState } from "react";
import SubmitRSVP from "./SubmitRSVP";

export default function RSVPPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [resetKey, setResetKey] = useState(0);

  const handleHomeClick = () => {
    // Increment resetKey to remount SubmitRSVP with fresh state
    setResetKey(prev => prev + 1);
    setActiveTab("home");
  };

  return (
    <div>
      {/* Always render SubmitRSVP with key so it resets */}
      <SubmitRSVP
        key={resetKey}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onHomeClick={handleHomeClick}
      />
    </div>
  );
}
