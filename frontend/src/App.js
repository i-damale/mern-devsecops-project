import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import Upload from './components/Upload';
import Logs from './components/Logs';
import Stats from './components/Stats';
import { FileProvider } from './context/FileContext';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || (path === '/upload' && location.pathname === '/');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/upload" className="brand-link">
          <img src="/logo.png" alt="Logo" style={{ height: '65px', width: '100%' }} />
        </Link>
      </div>
      <div className="nav-links">
        <Link 
          to="/upload" 
          className={`nav-link ${isActive('/upload') || isActive('/') ? 'active' : ''}`}
        >
          📤 Upload
        </Link>
        <Link 
          to="/logs" 
          className={`nav-link ${isActive('/logs') ? 'active' : ''}`}
        >
          📋 Logs
        </Link>
        <Link 
          to="/stats" 
          className={`nav-link ${isActive('/stats') ? 'active' : ''}`}
        >
          📊 Stats
        </Link>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} TraceAlyzer. Built for performance. 🚀</p>
    </footer>
  );
}

function App() {
  return (
    <Router>
      <FileProvider>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/upload" element={<Upload />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="*" element={<Upload />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </FileProvider>
    </Router>
  );
}

export default App;
