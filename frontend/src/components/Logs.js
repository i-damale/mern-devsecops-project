import React, { useState, useEffect, useRef } from 'react';
import { useFile } from '../context/FileContext';
import './Logs.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export default function Logs() {
  const { uploadedFile } = useFile();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [level, setLevel] = useState('');
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');
  const [ip, setIp] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pagination, setPagination] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // card, table, compact
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const searchInputRef = useRef(null);
  
  const fetchLogs = async (page = 1) => {
    setLoading(true);
    setError('');
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20'
    });
    
    if (level) params.append('level', level);
    if (search) params.append('search', search);
    if (source) params.append('source', source);
    if (method) params.append('method', method);
    if (status) params.append('status', status);
    if (ip) params.append('ip', ip);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/logs?${params}`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch logs');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (uploadedFile) {
      fetchLogs();
    } else {
      // Clear logs when no file is uploaded
      setLogs([]);
      setPagination(null);
      setError('');
    }
  }, [uploadedFile, level, search, source, method, status, ip, fromDate, toDate]);
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    // Display in user's local timezone with timezone indicator
    const localString = date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
    return localString;
  };

  const formatTimestampShort = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  const getLevelColor = (level) => {
    switch(level) {
      case 'ERROR': return '#dc3545';
      case 'WARN': return '#fd7e14';
      case 'INFO': return '#0073e6';
      case 'DEBUG': return '#6c757d';
      default: return '#333';
    }
  };

  const getLevelIcon = (level) => {
    switch(level) {
      case 'ERROR': return '🚨';
      case 'WARN': return '⚠️';
      case 'INFO': return 'ℹ️';
      case 'DEBUG': return '🔍';
      default: return '📝';
    }
  };

  const clearFilters = () => {
    setLevel('');
    setSearch('');
    setSource('');
    setMethod('');
    setStatus('');
    setIp('');
    setFromDate('');
    setToDate('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (level) count++;
    if (search) count++;
    if (source) count++;
    if (method) count++;
    if (status) count++;
    if (ip) count++;
    if (fromDate) count++;
    if (toDate) count++;
    return count;
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchLogs(pagination?.currentPage || 1);
      }, 5000); // Refresh every 5 seconds
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, pagination?.currentPage]);

  // Quick filter presets
  const applyQuickFilter = (filterType) => {
    clearFilters();
    switch (filterType) {
      case 'errors':
        setLevel('ERROR');
        break;
      case 'recent':
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString().slice(0, 16);
        setFromDate(oneHourAgo);
        break;
      case 'warnings':
        setLevel('WARN');
        break;
      case 'info':
        setLevel('INFO');
        break;
      default:
        break;
    }
  };

  // Focus search input with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const renderLogEntry = (log, index) => {
    if (viewMode === 'table') {
      return (
        <tr key={index} className="table-row" onClick={() => setSelectedLog(selectedLog === index ? null : index)}>
          <td className="table-cell">
            <span className="level-badge" style={{ backgroundColor: getLevelColor(log.level) }}>
              {getLevelIcon(log.level)} {log.level}
            </span>
          </td>
          <td className="table-cell">{formatTimestamp(log.timestamp)}</td>
          <td className="table-cell">{log.message}</td>
          <td className="table-cell">{log.source || '-'}</td>
          <td className="table-cell">{log.ip || '-'}</td>
        </tr>
      );
    }

    if (viewMode === 'compact') {
      return (
        <div key={index} className="log-entry compact" onClick={() => setSelectedLog(selectedLog === index ? null : index)}>
          <div className="compact-content">
            <span className="level-badge small" style={{ backgroundColor: getLevelColor(log.level) }}>
              {getLevelIcon(log.level)}
            </span>
            <span className="compact-timestamp">{formatTimestamp(log.timestamp)}</span>
            <span className="compact-message">{log.message}</span>
          </div>
        </div>
      );
    }

    // Default card view
    return (
      <div key={index} className="log-entry card" onClick={() => setSelectedLog(selectedLog === index ? null : index)}>
        <div className="log-header">
          <div className="log-level">
            <span className="level-badge" style={{ backgroundColor: getLevelColor(log.level) }}>
              {getLevelIcon(log.level)} {log.level}
            </span>
          </div>
          <div className="log-timestamp">
            🕒 {formatTimestamp(log.timestamp)}
          </div>
        </div>
        
        <div className="log-message">
          {log.message}
        </div>
        
        <div className="log-meta">
          {log.source && (
            <span className="meta-item">
              🏷️ <strong>Source:</strong> {log.source}
            </span>
          )}
          {log.ip && (
            <span className="meta-item">
              🌐 <strong>IP:</strong> {log.ip}
            </span>
          )}
          {log.method && (
            <span className="meta-item">
              🔄 <strong>Method:</strong> {log.method}
            </span>
          )}
          {log.status && (
            <span className="meta-item">
              📊 <strong>Status:</strong> {log.status}
            </span>
          )}
        </div>
        
        {selectedLog === index && (
          <div className="log-details">
            <h4>📋 Full Log Details</h4>
            <pre>{JSON.stringify(log, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  };
  
  // Show file upload prompt if no file is uploaded
  if (!uploadedFile) {
    return (
      <div className="stats-container">
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No Log File Uploaded</h3>
          <p>Please upload a log file first to view and analyze stats.</p>
          <div className="upload-hint">
            💡 Use the Upload tab to select and upload your log file
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="logs-container">
      {/* Enhanced Header with Stats and Controls */}
      <div className="logs-header-section">
        <div className="logs-header">
          <div className="header-left">
            <h2 className="logs-title">📋 Logs Viewer</h2>
            {pagination && (
              <div className="logs-summary">
                <span className="summary-item">
                  📊 {pagination.totalCount.toLocaleString()} total logs
                </span>
                <span className="summary-item">
                  📄 Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>
            )}
          </div>
          <div className="header-right">
            <div className="view-controls">
              <button
                className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
                onClick={() => setViewMode('card')}
                title="Card View"
              >
                📋
              </button>
              <button
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                📊
              </button>
              <button
                className={`view-btn ${viewMode === 'compact' ? 'active' : ''}`}
                onClick={() => setViewMode('compact')}
                title="Compact View"
              >
                📏
              </button>
            </div>
            <button
              className={`auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
              title="Auto Refresh (5s)"
            >
              {autoRefresh ? '⏸️' : '🔄'} Auto
            </button>
            <button 
              className="refresh-btn"
              onClick={() => fetchLogs(pagination?.currentPage || 1)}
              title="Manual Refresh"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="quick-actions">
          <div className="quick-filters">
            <button 
              className={`quick-filter ${level === 'ERROR' ? 'active' : ''}`}
              onClick={() => applyQuickFilter('errors')}
            >
              🚨 Errors Only
            </button>
            <button 
              className={`quick-filter ${level === 'WARN' ? 'active' : ''}`}
              onClick={() => applyQuickFilter('warnings')}
            >
              ⚠️ Warnings
            </button>
            <button 
              className={`quick-filter ${level === 'INFO' ? 'active' : ''}`}
              onClick={() => applyQuickFilter('info')}
            >
              ℹ️ Info
            </button>
            <button 
              className={`quick-filter ${fromDate ? 'active' : ''}`}
              onClick={() => applyQuickFilter('recent')}
            >
              🕒 Last Hour
            </button>
          </div>
          
          <div className="search-section">
            <div className="search-input-wrapper">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="🔍 Search logs... (Ctrl+F)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="quick-search"
              />
              <button 
                className={`filter-toggle ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                🔧 {showFilters ? 'Hide' : 'Show'} Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
              </button>
              {getActiveFilterCount() > 0 && (
                <button className="clear-filters" onClick={clearFilters}>
                  🗑️ Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-row">
            <div className="filter-group">
              <label>Search Messages</label>
              <input
                type="text"
                placeholder="Search in log messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>Log Level</label>
              <select 
                value={level} 
                onChange={(e) => setLevel(e.target.value)} 
                className="filter-select"
              >
                <option value="">All Levels</option>
                <option value="ERROR">🚨 ERROR</option>
                <option value="WARN">⚠️ WARN</option>
                <option value="INFO">ℹ️ INFO</option>
                <option value="DEBUG">🔍 DEBUG</option>
              </select>
            </div>
          </div>
          
          <div className="filters-row">
            <div className="filter-group">
              <label>Source/Service</label>
              <input
                type="text"
                placeholder="Filter by source..."
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>HTTP Method</label>
              <input
                type="text"
                placeholder="GET, POST, etc..."
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>Status Code</label>
              <input
                type="text"
                placeholder="200, 404, 500..."
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>IP Address</label>
              <input
                type="text"
                placeholder="192.168.1.1..."
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="filter-input"
              />
            </div>
          </div>
          
          <div className="filters-row">
            <div className="filter-group">
              <label>From Date</label>
              <input
                type="datetime-local"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>To Date</label>
              <input
                type="datetime-local"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="filter-input"
              />
            </div>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          Loading logs...
        </div>
      )}
      
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}
      
      {logs.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No logs found</h3>
          <p>Try uploading a log file first or adjusting your filters.</p>
        </div>
      )}
      
      {/* Logs Display */}
      <div className={`logs-display ${viewMode}`}>
        {viewMode === 'table' ? (
          <table className="logs-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Timestamp</th>
                <th>Message</th>
                <th>Source</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => renderLogEntry(log, index))}
            </tbody>
          </table>
        ) : (
          <div className="logs-list">
            {logs.map((log, index) => renderLogEntry(log, index))}
          </div>
        )}
      </div>
      
      {pagination && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => fetchLogs(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
          >
            ⬅️ Previous
          </button>
          
          <div className="pagination-info">
            <span className="page-numbers">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <span className="total-count">
              ({pagination.totalCount.toLocaleString()} total logs)
            </span>
          </div>
          
          <button 
            className="pagination-btn"
            onClick={() => fetchLogs(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
          >
            Next ➡️
          </button>
        </div>
      )}
    </div>
  );
}
