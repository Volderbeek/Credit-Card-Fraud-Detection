import React from 'react';

export default function ScanResults({ 
  result, 
  loading, 
  error, 
  backendStatus, 
  categories, 
  date 
}) {
  return (
    <section className="results-panel">
      <h2 className="section-title">Scan Results</h2>

      {/* Error Message */}
      {error && (
        <div className="error-card">
          <div className="error-title">⚠️ Connection/Validation Alert</div>
          <p>{error}</p>
          {backendStatus === 'offline' && (
            <div className="error-tips">
              <strong>Tip:</strong> Ensure you have run the Flask backend server:
              <code>python backend/app.py</code>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="empty-state">
          <div className="radar-circle">
            <div className="radar-sweep"></div>
            <span className="radar-pulse"></span>
          </div>
          <h3>ShieldFlow Passive Mode</h3>
          <p>Awaiting transaction input to trigger predictive scan. Configure variables on the left panel or click any preset to begin analysis.</p>
        </div>
      )}

      {/* Loading/Scanning UI */}
      {loading && (
        <div className="skeleton-container">
          <div className="skeleton-gauge"></div>
          <div className="skeleton-bar title"></div>
          <div className="skeleton-bar line-1"></div>
          <div className="skeleton-bar line-2"></div>
          <div className="skeleton-bar grid-row"></div>
        </div>
      )}

      {/* Loaded Result UI */}
      {result && !loading && !error && (
        <div className="scan-report-container fade-in">
          {/* Risk Gauge widget */}
          <div className="gauge-display-wrapper">
            <div className={`gauge-ring-outer ${result.risk_level.toLowerCase()}`}>
              <div className="gauge-progress-circle" style={{
                '--percentage': `${result.fraud_probability * 100}`
              }}></div>
              <div className="gauge-inner-card">
                <span className="gauge-label">FRAUD RISK</span>
                <span className="gauge-percentage">{(result.fraud_probability * 100).toFixed(0)}%</span>
                <span className={`gauge-status-badge ${result.risk_level.toLowerCase()}`}>
                  {result.risk_level} Risk
                </span>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <h3 className={`summary-title ${result.risk_level.toLowerCase()}`}>
              {result.is_fraud ? '🔴 Transaction Flagged: High Risk' : '🟢 Transaction Passed: Safe'}
            </h3>
            <p className="summary-text">
              This transaction has a <strong>{(result.legitimate_probability * 100).toFixed(0)}%</strong> chance of being legitimate. 
              {result.is_fraud ? 
                ' The ML classifier has detected high anomaly patterns and recommends hold/manual verification.' : 
                ' The transaction details align with standard, safe behavior profiles.'
              }
            </p>
          </div>

          {/* Diagnostic Details */}
          <div className="diagnostic-details">
            <h4>Feature Diagnostic Breakdown</h4>
            <div className="diagnostic-grid">
              
              <div className="diag-item">
                <span className="diag-label">Night Purchase</span>
                <span className={`diag-value ${result.features_processed.night ? 'flagged' : 'normal'}`}>
                  {result.features_processed.night ? 'Yes (Late Hours)' : 'No (Standard Time)'}
                </span>
              </div>

              <div className="diag-item">
                <span className="diag-label">Weekend Purchase</span>
                <span className="diag-value">
                  {result.features_processed.weekend ? 'Yes (Sat-Sun/Mon)' : 'No (Weekday)'}
                </span>
              </div>

              <div className="diag-item">
                <span className="diag-label">30-Day Activity</span>
                <span className={`diag-value ${result.features_processed.last_30_days > 200 ? 'flagged' : 'normal'}`}>
                  {result.features_processed.last_30_days} Transactions
                </span>
              </div>

              <div className="diag-item">
                <span className="diag-label">Month</span>
                <span className="diag-value">
                  {new Date(date).toLocaleString('default', { month: 'long' })}
                </span>
              </div>

              <div className="diag-item">
                <span className="diag-label">Category Profile</span>
                <span className="diag-value">
                  {categories[result.features_processed.category_idx]?.label}
                </span>
              </div>

              <div className="diag-item">
                <span className="diag-label">Zip Location</span>
                <span className="diag-value">{result.features_processed.zip_code}</span>
              </div>
            </div>
          </div>

          <div className="recommendation-footer">
            <span className="info-icon">ℹ️</span>
            <span>Recommendation: {result.is_fraud ? 'Request secondary 2FA verification from cardholder.' : 'Approve settlement immediately.'}</span>
          </div>
        </div>
      )}
    </section>
  );
}
