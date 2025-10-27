import React, { useState } from 'react';
import { useFile } from '../context/FileContext';
import './Upload.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export default function Upload() {
  const { uploadedFile, setFile, clearFile } = useFile();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setMessage('');
    setError('');
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setMessage('');
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadedFile) {
      setError('Please select a file.');
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    const formData = new FormData();
    formData.append('logFile', uploadedFile);
    try {
      const res = await fetch(`${BACKEND_URL}/api/logs/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Success: ${data.message} (${data.count} logs parsed)`);
        const input = document.querySelector('input[type="file"]');
        if (input) input.value = '';
        // Keep the uploaded file in context so other components know a file was uploaded
        // Don't clear it here - only clear when user explicitly removes it
      } else {
        setError(`❌ ${data.error || 'Upload failed.'}`);
      }
    } catch (err) {
      setError('❌ Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2 className="upload-title">📤 Upload Log File</h2>
        <p className="upload-description">
          Upload your log files in various formats (Apache, Nginx, JSON, Syslog, Docker, Kernel)
        </p>
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div 
            className={`file-drop-zone ${dragActive ? 'drag-active' : ''} ${uploadedFile ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              accept=".log,.txt,.json" 
              onChange={handleFileChange}
              className="file-input"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="file-label">
              {uploadedFile ? (
                <div className="file-info">
                  <div className="file-icon">📄</div>
                  <div className="file-details">
                    <div className="file-name">{uploadedFile.name}</div>
                    <div className="file-size">{formatFileSize(uploadedFile.size)}</div>
                  </div>
                </div>
              ) : (
                <div className="upload-prompt">
                  <div className="upload-icon">📁</div>
                  <div className="upload-text">
                    <strong>Click to browse</strong> or drag and drop your log file here
                  </div>
                  <div className="supported-formats">
                    Supported formats: .log, .txt, .json
                  </div>
                </div>
              )}
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading || !uploadedFile}
            className={`upload-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              '🚀 Upload & Parse'
            )}
          </button>
        </form>

        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="supported-formats-info">
          <h3>📋 Supported Log Formats</h3>
          <div className="format-grid">
            <div className="format-item">🔷 Apache Access Logs</div>
            <div className="format-item">🔷 Nginx Logs</div>
            <div className="format-item">🔷 JSON Structured Logs</div>
            <div className="format-item">🔷 Syslog Format</div>
            <div className="format-item">🔷 Docker Logs</div>
            <div className="format-item">🔷 Kernel Logs</div>
          </div>
        </div>
      </div>
    </div>
  );
}
