import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import SubmitForm from './components/SubmitForm';
//import TablePage from './components/TablePage';
//import keepServerAlive from './components/KeepServerAlive';
//import ReportPage from './components/ReportPage';
import './styles/App.css';

function App() {
  const [pollRefreshTrigger, setPollRefreshTrigger] = useState(0);

  useEffect(() => {
    keepServerAlive();
  }, []);

    return (
    <Router>
      <Routes>
        <Route path="/" element={<SubmitForm />} />
      </Routes>
    </Router>
  );
  /*
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SubmitForm />} />
        <Route path="/data" element={<TablePage pollRefreshTrigger={pollRefreshTrigger} setPollRefreshTrigger={setPollRefreshTrigger} />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
    </Router>
  );*/
}

export default App;