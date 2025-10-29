import React, { useState } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
//import SubmitRSVP from './components/SubmitRSVP';
import Home from './components/Home';
import Admin from './components/Admin';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;