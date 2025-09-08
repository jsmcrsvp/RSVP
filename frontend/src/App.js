import React, { useState } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import SubmitRSVP from './components/SubmitRSVP';
import AddProgramForm from './components/AddProgramForm';
import Admin from './components/Admin';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Replace old default page with RSVP form */}
        <Route path="/" element={<SubmitRSVP />} />

        {/* Add program still works */}
        <Route path="/add-program" element={<AddProgramForm />} />

        {/* Admin Page */}
        <Route path="/admin" element={<Admin />} />

        {/* Optional: direct route to RSVP form */}
        <Route path="/submit-rsvp" element={<SubmitRSVP />} />
      </Routes>
    </Router>
  );
}

export default App;
