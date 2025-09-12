import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import RSVPPage from "./components/RSVPPage";
import MemberRSVP from "./components/SubmitRSVP/MemberRSVP";
import NonMemberRSVP from "./components/SubmitRSVP/NonMemberRSVP";
import VerifyRSVP from "./components/VerifyRSVP";

import SubmitRSVPLanding from "./pages/SubmitRSVPLanding";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route → Home */}
        {/*<Route path="/" element={<Home />} />*/}
        <Route path="/" element={<RSVPPage />} />

        {/* Explicit routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/member-rsvp" element={<MemberRSVP />} />
        <Route path="/nonmember-rsvp" element={<NonMemberRSVP />} />
        <Route path="/verify" element={<VerifyRSVP />} />
        <Route path="/submit-rsvp" element={<SubmitRSVPLanding />} />
        
        {/* Admin Page
        <Route path="/admin" element={<Admin />} /> */}

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;


/*
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
        {/* Replace old default page with RSVP form
        <Route path="/" element={<SubmitRSVP />} />

        {/* Add program still works
        <Route path="/add-program" element={<AddProgramForm />} />

        {/* Admin Page
        <Route path="/admin" element={<Admin />} />

        {/* Optional: direct route to RSVP form
        <Route path="/submit-rsvp" element={<SubmitRSVP />} />
      </Routes>
    </Router>
  );
}

export default App;
*/