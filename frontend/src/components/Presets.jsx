import React from 'react';

export default function Presets({ presets, onPresetClick }) {
  return (
    <div className="presets-container">
      <span className="presets-label">Simulation Presets:</span>
      <div className="presets-grid">
        {presets.map((preset, index) => (
          <button 
            key={index} 
            type="button" 
            className="preset-btn"
            onClick={() => onPresetClick(preset.data)}
            title={preset.description}
          >
            <span className="preset-icon">{preset.icon}</span>
            <span className="preset-name">{preset.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
