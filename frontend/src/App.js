import React, { useState } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
//import SubmitForm from './components/SubmitForm';  // ❌ old member search
import SubmitRSVPForm from './components/SubmitRSVPForm'; // ✅ new RSVP form
import AddProgramForm from './components/AddProgramForm';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Replace old default page with RSVP form */}
        <Route path="/" element={<SubmitRSVPForm />} />

        {/* Add program still works */}
        <Route path="/add-program" element={<AddProgramForm />} />

        {/* Optional: direct route to RSVP form */}
        <Route path="/submit-rsvp" element={<SubmitRSVPForm />} />
      </Routes>
    </Router>
  );
}

export default App;
