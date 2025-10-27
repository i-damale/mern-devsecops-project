import React, { useEffect, useState } from 'react';
import { useFile } from '../context/FileContext';
import './Stats.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export default function Stats() {
  const { uploadedFile } = useFile();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/logs/stats`);
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      } else {
        setError(data.error || 'Failed to fetch stats.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uploadedFile) {
      fetchStats();
    } else {
      setStats(null);
    }
  }, [uploadedFile]);

  const getErrorRate = () => {
    if (!stats || stats.total === 0) return 0;
    return ((stats.errors / stats.total) * 100).toFixed(1);
  };

  const getSuccessRate = () => {
    if (!stats || stats.total === 0) return 0;
    return (((stats.total - stats.errors) / stats.total) * 100).toFixed(1);
  };

  const renderProgressBar = (value, total, color = '#0073e6') => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
        <span className="progress-text">{value.toLocaleString()}</span>
      </div>
    );
  };

  const renderSourceChart = () => {
    if (!stats?.sources?.length) return null;
    
    const maxCount = Math.max(...stats.sources.map(s => s.count));
    
    return (
      <div className="chart-container">
        <h3 className="chart-title">📊 Top Log Sources</h3>
        <div className="bar-chart">
          {stats.sources.slice(0, 8).map((source, index) => (
            <div key={source._id || index} className="bar-item">
              <div className="bar-label">{source._id || 'Unknown'}</div>
              <div className="bar">
                <div 
                  className="bar-fill"
                  style={{ 
                    width: `${(source.count / maxCount) * 100}%`,
                    backgroundColor: `hsl(${index * 45}, 70%, 60%)` 
                  }}
                ></div>
                <span className="bar-value">{source.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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

  if (loading) {
    return (
      <div className="stats-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-container">
        <div className="error-message">
          ❌ {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="stats-container">
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <h3>No statistics available</h3>
          <p>Upload some log files to see analytics and statistics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <div className="stats-header">
        <h2 className="stats-title">📊 Log Analytics Dashboard</h2>
        <button className="refresh-btn" onClick={fetchStats}>
          🔄 Refresh
        </button>
      </div>

      <div className="stats-grid">
        {/* Overview Cards */}
        <div className="stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total.toLocaleString()}</div>
            <div className="stat-label">Total Logs</div>
          </div>
        </div>

        <div className="stat-card errors">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-value">{stats.errors.toLocaleString()}</div>
            <div className="stat-label">Error Logs</div>
            <div className="stat-percentage">{getErrorRate()}% error rate</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">ℹ️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.info.toLocaleString()}</div>
            <div className="stat-label">Info Logs</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{getSuccessRate()}%</div>
            <div className="stat-label">Success Rate</div>
            <div className="stat-percentage">Non-error logs</div>
          </div>
        </div>
      </div>

      {/* Log Levels Breakdown */}
      <div className="breakdown-section">
        <h3 className="section-title">📈 Log Levels Breakdown</h3>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-label">🚨 Errors</span>
              <span className="breakdown-count">{stats.errors}</span>
            </div>
            {renderProgressBar(stats.errors, stats.total, '#dc3545')}
          </div>
          
          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-label">ℹ️ Info</span>
              <span className="breakdown-count">{stats.info}</span>
            </div>
            {renderProgressBar(stats.info, stats.total, '#0073e6')}
          </div>
          
          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-label">⚠️ Warnings</span>
              <span className="breakdown-count">{stats.warnings || 0}</span>
            </div>
            {renderProgressBar(stats.warnings || 0, stats.total, '#fd7e14')}
          </div>
          
          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-label">🔍 Debug</span>
              <span className="breakdown-count">{stats.debug || 0}</span>
            </div>
            {renderProgressBar(stats.debug || 0, stats.total, '#6c757d')}
          </div>
        </div>
      </div>

      {/* Sources Chart */}
      {renderSourceChart()}

      {/* Health Score */}
      <div className="health-section">
        <h3 className="section-title">🏥 System Health Score</h3>
        <div className="health-score">
          <div className="health-circle">
            <div className="health-percentage">{getSuccessRate()}%</div>
            <div className="health-label">Healthy</div>
          </div>
          <div className="health-details">
            <div className="health-item">
              <span className="health-indicator good">●</span>
              <span>Good: {((stats.total - stats.errors) || 0).toLocaleString()} logs</span>
            </div>
            <div className="health-item">
              <span className="health-indicator bad">●</span>
              <span>Issues: {stats.errors.toLocaleString()} logs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
