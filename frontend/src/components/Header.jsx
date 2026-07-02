import React from 'react';

export default function Header({ backendStatus }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-icon">🛡️</div>
        <div className="logo-text">
          <h1>ShieldFlow</h1>
          <span>AI TRANSACTION RISK EVALUATION ENGINE</span>
        </div>
      </div>
      <div className="backend-indicator">
        <span className={`status-dot ${backendStatus}`}></span>
        <span className="status-label">
          {backendStatus === 'online' && 'Model Core Online'}
          {backendStatus === 'checking' && 'Checking System...'}
          {backendStatus === 'warning' && 'Model Mismatch'}
          {backendStatus === 'offline' && 'Model Core Offline'}
        </span>
      </div>
    </header>
  );
}
