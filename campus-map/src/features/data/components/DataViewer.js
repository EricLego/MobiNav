// src/components/DataViewer.js
import React, { useState } from 'react';
// Removed useEffect and mapService imports
import './DataViewer.css';

const DataViewer = ({ buildings = [], entrances = [], paths = [], obstacles = [] }) => { // Accept props with default empty arrays
  const [activeType, setActiveType] = useState('building');
  // Removed internal data, loading, and error states

  // Determine which data array to use based on activeType
  const currentData = (() => {
    switch (activeType) {
      case 'building':
        return buildings;
      case 'entrance':
        return entrances;
      case 'path':
        return paths;
      case 'obstacle':
        return obstacles;
      default:
        return [];
    }
  })();

  // Removed fetchData and getMockData functions

  const renderDataItem = (item) => {
    switch(activeType) {
      case 'building':
        return (
          <div className="data-item" key={item.building_id}>
            <h3>{item.name}</h3>
            <p>{item.address} {item.street}</p>
            {/* Use latitude/longitude directly from props */}
            <p className="coordinates">Lat: {item.latitude}, Lng: {item.longitude}</p>
          </div>
        );
      case 'entrance':
        return (
          <div className="data-item" key={item.entrance_id}>
            <h3>{item.entrance_name}</h3>
            <p>Building ID: {item.building_id}</p>
            <p className={item.wheelchair_accessible ? "accessible" : "not-accessible"}>
              {item.wheelchair_accessible ? "♿ Wheelchair Accessible" : "⚠️ Not Wheelchair Accessible"}
            </p>
            <p className="coordinates">Lat: {item.latitude}, Lng: {item.longitude}</p>
          </div>
        );
      case 'path':
        return (
          <div className="data-item" key={item.path_id}>
            <h3>Path {item.path_id}</h3>
            {/* Assuming start/end location IDs are sufficient for display */}
            <p>From Loc ID: {item.start_location_id} to Loc ID: {item.end_location_id}</p>
            <p>Distance: {item.distance ? `${item.distance.toFixed(1)}m` : 'N/A'}</p>
            <div className="path-attributes">
              {item.is_wheelchair_accessible && <span className="tag accessible">♿ Accessible</span>}
              {!item.is_wheelchair_accessible && <span className="tag not-accessible">⚠️ Not Accessible</span>}
              {item.has_stairs && <span className="tag stairs">🪜 Has Stairs</span>}
              {item.is_paved && <span className="tag paved">Paved</span>} {/* Added paved tag */}
              {item.had_incline && <span className="tag incline">Incline</span>} {/* Added incline tag */}
            </div>
          </div>
        );
      case 'obstacle':
        return (
          <div className="data-item" key={item.obstacle_id}>
            <h3>Obstacle {item.obstacle_id}</h3>
            <p>{item.description}</p>
            <p className={`severity severity-${item.severity_level}`}>
              {/* Adjust severity display if needed */}
              Severity: {item.severity_level === 1 ? 'Low' : item.severity_level === 2 ? 'Medium' : 'High'}
            </p>
            <p className={`status ${item.status ? `status-${item.status.toLowerCase().replace(/\s+/g, '-')}` : ''}`}>
              Status: {item.status}
            </p>
            {/* Display coordinates if available */}
            {item.latitude && item.longitude && (
                <p className="coordinates">Lat: {item.latitude}, Lng: {item.longitude}</p>
            )}
            <p>Reported: {item.reported_at ? new Date(item.reported_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        );
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
          Buildings ({buildings.length}) {/* Show count */}
        </button>
        <button
          className={activeType === 'entrance' ? 'active' : ''}
          onClick={() => setActiveType('entrance')}
        >
          Entrances ({entrances.length}) {/* Show count */}
        </button>
        <button
          className={activeType === 'path' ? 'active' : ''}
          onClick={() => setActiveType('path')}
        >
          Paths ({paths.length}) {/* Show count */}
        </button>
        <button
          className={activeType === 'obstacle' ? 'active' : ''}
          onClick={() => setActiveType('obstacle')}
        >
          Obstacles ({obstacles.length}) {/* Show count */}
        </button>
      </div>

      <div className="data-content">
        <h2>{activeType.charAt(0).toUpperCase() + activeType.slice(1)}s</h2>

        {/* Removed loading and error states, assuming parent handles them */}

        {currentData.length === 0 && (
          <div className="empty-state">No {activeType} data available</div>
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
