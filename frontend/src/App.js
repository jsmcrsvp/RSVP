import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import MemberRSVP from "./pages/MemberRSVP";
import NonMemberRSVP from "./pages/NonMemberRSVP";
import Verify from "./pages/Verify";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route → Home */}
        <Route path="/" element={<Home />} />

        {/* Explicit routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/member-rsvp" element={<MemberRSVP />} />
        <Route path="/nonmember-rsvp" element={<NonMemberRSVP />} />
        <Route path="/verify" element={<Verify />} />

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