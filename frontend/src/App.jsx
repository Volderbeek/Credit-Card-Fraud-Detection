import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Presets from './components/Presets';
import ScanForm from './components/ScanForm';
import ScanResults from './components/ScanResults';
import './App.css';

const API_BASE = 'https://fraud-detection-backend-680456524697.us-central1.run.app';

const CATEGORIES = [
  { id: 0, label: 'Entertainment', icon: '🎬' },
  { id: 1, label: 'Food/Dining', icon: '🍔' },
  { id: 2, label: 'Transportation', icon: '🚗' },
  { id: 3, label: 'Grocery (Internet)', icon: '🛒' },
  { id: 4, label: 'Grocery (In-Store)', icon: '🏪' },
  { id: 5, label: 'Health and Fitness', icon: '💪' },
  { id: 6, label: 'Home', icon: '🏠' },
  { id: 7, label: 'Kids and Pets', icon: '🐾' },
  { id: 8, label: 'Miscellaneous (Internet)', icon: '🌐' },
  { id: 9, label: 'Miscellaneous (In-Store)', icon: '🛍️' },
  { id: 10, label: 'Personal Care', icon: '🧴' },
  { id: 11, label: 'Internet Shopping', icon: '💻' },
  { id: 12, label: 'In-Store Shopping', icon: '🏬' },
  { id: 13, label: 'Travel', icon: '✈️' }
];

const PRESETS = [
  {
    name: 'Safe Lunch Dining',
    description: 'A typical low-value restaurant purchase at noon.',
    icon: '🍔',
    data: {
      amount: 15.50,
      time: 12,
      date: new Date().toISOString().split('T')[0],
      category: 1, // Food/Dining
      age: 30,
      last_30_days: 5,
      zip: 90210
    }
  },
  {
    name: 'Safe Gym Membership',
    description: 'Standard monthly fitness subscription transaction at noon.',
    icon: '💪',
    data: {
      amount: 29.99,
      time: 12,
      date: new Date().toISOString().split('T')[0],
      category: 5, // Health and Fitness
      age: 35,
      last_30_days: 5,
      zip: 90210
    }
  },
  {
    name: 'Suspicious Midnight Online',
    description: 'High-value internet shopping order at 11 PM.',
    icon: '🚨',
    data: {
      amount: 950.00,
      time: 23,
      date: new Date().toISOString().split('T')[0],
      category: 11, // Internet Shopping
      age: 22,
      last_30_days: 5,
      zip: 10001
    }
  },
  {
    name: 'Suspicious Late Night Gas',
    description: 'Fuel station purchase during late night hours (3 AM) at $22.',
    icon: '⚠️',
    data: {
      amount: 22.00,
      time: 3,
      date: new Date().toISOString().split('T')[0],
      category: 2, // Transportation
      age: 31,
      last_30_days: 15,
      zip: 60611
    }
  }
];

function App() {
  const [form, setForm] = useState({
    amount: 13.37,
    time: 12,
    date: new Date().toISOString().split('T')[0],
    category: 0,
    age: 35,
    last_30_days: 12,
    zip: 90210
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Check backend health
  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data.status === 'healthy') {
          setBackendStatus('online');
        } else {
          setBackendStatus('warning');
        }
      })
      .catch(() => {
        setBackendStatus('offline');
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    
    // Parse numeric fields properly
    if (['amount', 'time', 'category', 'age', 'last_30_days', 'zip'].includes(name)) {
      if (value === '') {
        val = '';
      } else {
        val = name === 'amount' ? parseFloat(value) : parseInt(value, 10);
      }
    }
    
    setForm(prev => ({ ...prev, [name]: val }));
  };

  const handlePresetClick = (presetData) => {
    setForm({ ...presetData });
    triggerPrediction(presetData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerPrediction(form);
  };

  const triggerPrediction = (formData) => {
    // Validate inputs before sending
    if (isNaN(formData.amount) || formData.amount < 0) {
      setError('Please enter a valid amount (>= 0)');
      return;
    }
    if (isNaN(formData.age) || formData.age < 18 || formData.age > 120) {
      setError('Please enter a valid age between 18 and 120');
      return;
    }
    if (isNaN(formData.last_30_days) || formData.last_30_days < 0 || formData.last_30_days > 400) {
      setError('Transactions in last 30 days should be between 0 and 400');
      return;
    }
    if (isNaN(formData.zip) || formData.zip < 0 || formData.zip > 99999) {
      setError('Please enter a valid 5-digit zip code');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    fetch(`${API_BASE}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Server prediction failed');
        }
        return data;
      })
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to communicate with prediction API. Ensure the backend server is running.');
        setLoading(false);
      });
  };

  return (
    <div className="app-container">
      <Header backendStatus={backendStatus} />

      <main className="dashboard-content">
        <div className="grid-container">
          
          {/* Config Panel */}
          <section className="config-panel">
            <h2 className="section-title">Scan Configuration</h2>
            <p className="section-desc">Adjust transaction metadata below or select a preset profile to run an instant diagnostic scan.</p>
            
            <Presets 
              presets={PRESETS} 
              onPresetClick={handlePresetClick} 
            />

            <ScanForm 
              form={form}
              onChange={handleChange}
              onSubmit={handleSubmit}
              loading={loading}
              backendOffline={backendStatus === 'offline'}
              categories={CATEGORIES}
            />
          </section>

          {/* Diagnostic Dashboard */}
          <ScanResults 
            result={result}
            loading={loading}
            error={error}
            backendStatus={backendStatus}
            categories={CATEGORIES}
            date={form.date}
          />

        </div>
      </main>

      <footer className="app-footer">
        <p>ShieldFlow AI Engine. Powered by Random Forest Classification. Model precision: ~99.8% validation accuracy.</p>
      </footer>
    </div>
  );
}

export default App;
