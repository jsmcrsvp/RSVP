import React, { useState } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
//import SubmitRSVP from './components/SubmitRSVP';
import Home from './components/Home';
import Admin from './components/Admin';
import TestHome from './components/TestHome';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/test" element={<TestHome />} />
      </Routes>
    </Router>
  );
}

export default App;