import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/DataViewer.css';

const DataViewer = () => {
  const [activeType, setActiveType] = useState('building');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData(activeType);
  }, [activeType]);

  const fetchData = async (type) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/${type}s`);
      setData(response.data);
    } catch (err) {
      console.error(`Error fetching ${type} data:`, err);
      setError(`Failed to load ${type} data. ${err.message}`);
      
      // Fallback mock data for testing UI
      setData(getMockData(type));
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (type) => {
    switch(type) {
      case 'building':
        return [
          { building_id: 1, name: 'Howell Hall', address: '634', street: 'Cheshier Road', latitude: 33.938187, longitude: -84.518817 },
          { building_id: 2, name: 'Recreation Center', address: '955', street: 'Technology Way', latitude: 33.941297, longitude: -84.517567 },
          { building_id: 3, name: 'Engineering Building', address: '840', street: 'Polytechnic Lane', latitude: 33.938552, longitude: -84.522363 }
        ];
      case 'entrance':
        return [
          { entrance_id: 1, building_id: 1, entrance_name: 'Main Entrance', wheelchair_accessible: true, latitude: 33.938187, longitude: -84.518817 },
          { entrance_id: 2, building_id: 1, entrance_name: 'Side Entrance', wheelchair_accessible: false, latitude: 33.938150, longitude: -84.518800 },
          { entrance_id: 3, building_id: 2, entrance_name: 'North Entrance', wheelchair_accessible: true, latitude: 33.941297, longitude: -84.517567 }
        ];
      case 'path':
        return [
          { path_id: 1, start_location_id: 1, end_location_id: 2, distance: 350, is_wheelchair_accessible: true, has_stairs: false },
          { path_id: 2, start_location_id: 2, end_location_id: 3, distance: 220, is_wheelchair_accessible: false, has_stairs: true },
          { path_id: 3, start_location_id: 1, end_location_id: 3, distance: 500, is_wheelchair_accessible: true, has_stairs: false }
        ];
      case 'obstacle':
        return [
          { obstacle_id: 1, description: 'Construction Zone', severity_level: 3, status: 'Active', reported_at: '2025-03-15' },
          { obstacle_id: 2, description: 'Broken Elevator', severity_level: 2, status: 'Under Review', reported_at: '2025-03-16' },
          { obstacle_id: 3, description: 'Temporary Barricade', severity_level: 1, status: 'Resolved', reported_at: '2025-03-10' }
        ];
      default:
        return [];
    }
  };

  const renderDataItem = (item) => {
    switch(activeType) {
      case 'building':
        return (
          <div className="data-item" key={item.building_id}>
            <h3>{item.name}</h3>
            <p>{item.address} {item.street}</p>
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
            <p>From Building {item.start_location_id} to Building {item.end_location_id}</p>
            <p>Distance: {item.distance}m</p>
            <div className="path-attributes">
              {item.is_wheelchair_accessible && <span className="tag accessible">♿ Accessible</span>}
              {!item.is_wheelchair_accessible && <span className="tag not-accessible">⚠️ Not Accessible</span>}
              {item.has_stairs && <span className="tag stairs">🪜 Has Stairs</span>}
            </div>
          </div>
        );
      case 'obstacle':
        return (
          <div className="data-item" key={item.obstacle_id}>
            <h3>Obstacle {item.obstacle_id}</h3>
            <p>{item.description}</p>
            <p className={`severity severity-${item.severity_level}`}>
              Severity: {['Low', 'Medium', 'High'][item.severity_level - 1]}
            </p>
            <p className={`status ${item.status ? `status-${item.status.toLowerCase().replace(/\s+/g, '-')}` : ''}`}>
              Status: {item.status}
            </p>
            <p>Reported: {item.reported_at}</p>
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
          Buildings
        </button>
        <button 
          className={activeType === 'entrance' ? 'active' : ''} 
          onClick={() => setActiveType('entrance')}
        >
          Entrances
        </button>
        <button 
          className={activeType === 'path' ? 'active' : ''} 
          onClick={() => setActiveType('path')}
        >
          Paths
        </button>
        <button 
          className={activeType === 'obstacle' ? 'active' : ''} 
          onClick={() => setActiveType('obstacle')}
        >
          Obstacles
        </button>
      </div>

      <div className="data-content">
        <h2>{activeType.charAt(0).toUpperCase() + activeType.slice(1)}s</h2>
        
        {loading && <div className="loading">Loading {activeType} data...</div>}
        
        {error && <div className="error-message">{error}</div>}
        
        {!loading && !error && data.length === 0 && (
          <div className="empty-state">No {activeType} data available</div>
        )}
        
        {!loading && !error && data.length > 0 && (
          <div className="data-grid">
            {data.map(item => renderDataItem(item))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataViewer;