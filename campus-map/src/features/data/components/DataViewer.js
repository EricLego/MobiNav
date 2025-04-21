// src/features/data/components/DataViewer.js
import React, { useState } from 'react';
import './DataViewer.css';

// Accept accessibilityFeatures and onDeleteItem as props
const DataViewer = ({
  buildings = [],
  entrances = [],
  obstacles = [],
  accessibilityFeatures = [], // Added prop
  onDeleteItem // Added prop for delete handler
}) => {
  // Default to showing buildings or the first available type
  const [activeType, setActiveType] = useState('building');

  // Determine which data array to use based on activeType
  const currentData = (() => {
    switch (activeType) {
      case 'building':
        return buildings;
      case 'entrance':
        return entrances;
      // --- Removed 'path' case ---
      case 'obstacle':
        return obstacles;
      // --- Added 'accessibilityFeature' case ---
      case 'accessibilityFeature':
        return accessibilityFeatures;
      // ---------------------------------------
      default:
        return [];
    }
  })();

  // Helper function to render the delete button if handler exists
  const renderDeleteButton = (item, type) => {
    if (!onDeleteItem) return null; // Don't render if no handler is provided

    // Use the correct ID field based on type
    const idField = {
        building: 'building_id',
        entrance: 'entrance_id',
        obstacle: 'obstacle_id',
        accessibilityFeature: 'feature_id' // Assuming 'feature_id'
    }[type];
    const itemId = item[idField];

    return (
      <button
        className="delete-button"
        onClick={() => onDeleteItem(item, type)} // Call the handler passed via props
        title={`Delete ${type} ${itemId}`}
      >
        🗑️ Delete
      </button>
    );
  };


  const renderDataItem = (item) => {
    switch(activeType) {
      case 'building':
        return (
          <div className="data-item" key={item.building_id}>
            <div className="item-header">
                <h3>{item.name}</h3>
                {renderDeleteButton(item, 'building')}
            </div>
            <p>{item.address} {item.street}</p>
            <p className="coordinates">Lat: {item.latitude?.toFixed(5)}, Lng: {item.longitude?.toFixed(5)}</p>
          </div>
        );
      case 'entrance':
        return (
          <div className="data-item" key={item.entrance_id}>
            <div className="item-header">
                <h3>{item.entrance_name}</h3>
                {renderDeleteButton(item, 'entrance')}
            </div>
            <p>Building ID: {item.building_id}</p>
            <p className={item.wheelchair_accessible ? "accessible" : "not-accessible"}>
              {item.wheelchair_accessible ? "♿ Wheelchair Accessible" : "⚠️ Not Wheelchair Accessible"}
            </p>
            <p className="coordinates">Lat: {item.latitude?.toFixed(5)}, Lng: {item.longitude?.toFixed(5)}</p>
          </div>
        );
      // --- Removed 'path' rendering case ---
      case 'obstacle':
        return (
          <div className="data-item" key={item.obstacle_id}>
             <div className="item-header">
                <h3>Obstacle {item.obstacle_id}</h3>
                {renderDeleteButton(item, 'obstacle')}
            </div>
            <p>{item.description}</p>
            <p className={`severity severity-${item.severity_level}`}>
              Severity: {item.severity_level === 1 ? 'Low' : item.severity_level === 2 ? 'Medium' : 'High'}
            </p>
            <p className={`status ${item.status ? `status-${item.status.toLowerCase().replace(/\s+/g, '-')}` : ''}`}>
              Status: {item.status}
            </p>
            {item.latitude && item.longitude && (
                <p className="coordinates">Lat: {item.latitude?.toFixed(5)}, Lng: {item.longitude?.toFixed(5)}</p>
            )}
            <p>Reported: {item.reported_at ? new Date(item.reported_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        );
      // --- Added 'accessibilityFeature' rendering case ---
      case 'accessibilityFeature':
        return (
          <div className="data-item" key={item.feature_id}> {/* Assuming feature_id */}
             <div className="item-header">
                <h3>{item.feature_type || 'Accessibility Feature'}</h3>
                {renderDeleteButton(item, 'accessibilityFeature')}
            </div>
            {item.description && <p>{item.description}</p>}
            {item.building_id && <p>Building ID: {item.building_id}</p>}
            {item.latitude && item.longitude && (
                <p className="coordinates">Lat: {item.latitude?.toFixed(5)}, Lng: {item.longitude?.toFixed(5)}</p>
            )}
            {/* Add other relevant fields */}
          </div>
        );
      // -------------------------------------------------
      default:
        return null;
    }
  };

  return (
    <div className="data-viewer">
      <div className="type-selector">
        <button
          className={activeType === 'building' ? 'active' : ''}
          onClick={() => setActiveType('building')}
        >
          Buildings ({buildings.length})
        </button>
        <button
          className={activeType === 'entrance' ? 'active' : ''}
          onClick={() => setActiveType('entrance')}
        >
          Entrances ({entrances.length})
        </button>
        {/* --- Removed Path button --- */}
        <button
          className={activeType === 'obstacle' ? 'active' : ''}
          onClick={() => setActiveType('obstacle')}
        >
          Obstacles ({obstacles.length})
        </button>
        {/* --- Added Accessibility Feature button --- */}
        <button
          className={activeType === 'accessibilityFeature' ? 'active' : ''}
          onClick={() => setActiveType('accessibilityFeature')}
        >
          Accessibility ({accessibilityFeatures.length})
        </button>
        {/* ---------------------------------------- */}
      </div>

      <div className="data-content">
        <h2>{activeType.charAt(0).toUpperCase() + activeType.slice(1).replace('accessibilityFeature', 'Accessibility Features')}s</h2>

        {currentData.length === 0 && (
          <div className="empty-state">No {activeType.replace('accessibilityFeature', 'accessibility feature')} data available</div>
        )}

        {currentData.length > 0 && (
          <div className="data-grid">
            {currentData.map(item => renderDataItem(item))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataViewer;
