import React from 'react';

export default function ScanForm({ 
  form, 
  onChange, 
  onSubmit, 
  loading, 
  backendOffline, 
  categories 
}) {
  
  const formatHour = (hour) => {
    if (hour === 0) return '12:00 AM (Midnight)';
    if (hour === 12) return '12:00 PM (Noon)';
    return hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
  };

  return (
    <form onSubmit={onSubmit} className="prediction-form">
      <div className="form-group row-2">
        <div className="input-box">
          <label htmlFor="amount-input">Amount ($)</label>
          <div className="currency-wrapper">
            <span className="currency-symbol">$</span>
            <input
              id="amount-input"
              type="number"
              name="amount"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="input-box">
          <label htmlFor="category-select">Category</label>
          <select
            id="category-select"
            name="category"
            value={form.category}
            onChange={onChange}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group row-2">
        <div className="input-box">
          <label htmlFor="date-input">Transaction Date</label>
          <input
            id="date-input"
            type="date"
            name="date"
            value={form.date}
            onChange={onChange}
            required
          />
        </div>

        <div className="input-box">
          <label htmlFor="zip-input">Zip Code</label>
          <input
            id="zip-input"
            type="number"
            name="zip"
            min="0"
            max="99999"
            value={form.zip}
            onChange={onChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <div className="input-box">
          <div className="slider-label-row">
            <label htmlFor="time-slider">Transaction Time (Hour)</label>
            <span className="slider-value">{formatHour(form.time)}</span>
          </div>
          <input
            id="time-slider"
            type="range"
            name="time"
            min="0"
            max="23"
            value={form.time}
            onChange={onChange}
            className="hour-range-slider"
          />
          <div className="slider-ticks">
            <span>12am</span>
            <span>6am</span>
            <span>12pm</span>
            <span>6pm</span>
            <span>11pm</span>
          </div>
        </div>
      </div>

      <div className="form-group row-2">
        <div className="input-box">
          <label htmlFor="age-input">Customer Age</label>
          <input
            id="age-input"
            type="number"
            name="age"
            min="18"
            max="120"
            value={form.age}
            onChange={onChange}
            required
          />
        </div>

        <div className="input-box">
          <label htmlFor="freq-input">Transactions (Last 30 Days)</label>
          <input
            id="freq-input"
            type="number"
            name="last_30_days"
            min="0"
            max="400"
            value={form.last_30_days}
            onChange={onChange}
            required
          />
        </div>
      </div>

      <button 
        type="submit" 
        className={`submit-button ${loading ? 'scanning' : ''}`}
        disabled={loading || backendOffline}
      >
        {loading ? (
          <span className="scan-loader">
            <span className="pulse-ring"></span>
            Scanning Transaction...
          </span>
        ) : (
          'Run Fraud Risk Analysis'
        )}
      </button>
    </form>
  );
}
