import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import axios from 'axios';
import '../styles/MapEditor.css';
import DataViewer from './DataViewer';

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "600px",
};
const center = {
  lat: 33.9386, // KSU Marietta Campus center
  lng: -84.5187,
};


  

function MapEditor() {
  // Load Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // State for map data
  const [buildings, setBuildings] = useState([]);
  const [entrances, setEntrances] = useState([]);
  const [paths, setPaths] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [pathNodes, setPathNodes] = useState([]);

  // Editor state
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState("view"); // view, building, entrance, path, obstacle, pathNode
  const [newItem, setNewItem] = useState(null);

  // Camera Angle/Heading State
  const [cameraTilt, setCameraTilt] = useState(45);
  const [cameraHeading, setCameraHeading] = useState(0);
  
  // Selection state for path connections
  const [connectMode, setConnectMode] = useState(false);
  const [sourceNode, setSourceNode] = useState(null);

  // Click state
  const [clickPosition, setClickPosition] = useState(null);
  const [showClickMenu, setShowClickMenu] = useState(false);

  // Form state
  const [formData, setFormData] = useState({});
  
  const mapRef = useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const options = {
    disableDefaultUI: false,
    zoomControl: true,
    mapId: '481d275839837ca8',
    tilt: cameraTilt,
    heading: cameraHeading
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const buildingsResponse = await axios.get('/api/buildings');
        setBuildings(buildingsResponse.data);
        
        const entrancesResponse = await axios.get('/api/entrances');
        setEntrances(entrancesResponse.data);
        
        const pathsResponse = await axios.get('/api/paths');
        setPaths(pathsResponse.data);
        
        const obstaclesResponse = await axios.get('/api/obstacles');
        setObstacles(obstaclesResponse.data);
        
        // You would need to create a new API endpoint for path nodes
        // const pathNodesResponse = await axios.get('/api/pathnodes');
        // setPathNodes(pathNodesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();
  }, []);

  // Handle map clicks
  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    // If in connect mode, handle connection logic
    if (connectMode && sourceNode) {
      // Find the closest node to the click point
      const closestNode = findClosestNode(lat, lng);
      if (closestNode && closestNode.id !== sourceNode.id) {
        createPathBetweenNodes(sourceNode, closestNode);
        // Exit connect mode
        setConnectMode(false);
        setSourceNode(null);
        return;
      }
    }
    
    // Show click menu with options
    setClickPosition({ lat, lng });
    setShowClickMenu(true);
  };
  
  // Find the closest path node to a given location
  const findClosestNode = (lat, lng) => {
    if (pathNodes.length === 0) return null;
    
    let closestNode = null;
    let minDistance = Infinity;
    
    pathNodes.forEach(node => {
      const distance = calculateDistance(
        { lat, lng },
        { lat: node.latitude, lng: node.longitude }
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestNode = node;
      }
    });
    
    // Only return a node if it's within a reasonable distance (e.g., 10 meters)
    return minDistance < 10 ? closestNode : null;
  };
  
  // Calculate distance between two points
  const calculateDistance = (point1, point2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };
  
  // Create a path between two nodes
  const createPathBetweenNodes = async (source, target) => {
    try {
      const pathData = {
        start_location_id: source.id,
        end_location_id: target.id,
        is_wheelchair_accessible: formData.is_wheelchair_accessible || false,
        has_stairs: formData.has_stairs || false,
        had_incline: formData.had_incline || false,
        is_paved: formData.is_paved || true,
        distance: calculateDistance(
          { lat: source.latitude, lng: source.longitude },
          { lat: target.latitude, lng: target.longitude }
        )
      };
      
      const response = await axios.post('/api/paths', pathData);
      setPaths([...paths, response.data]);
      
      // Reset form data
      setFormData({});
      
    } catch (error) {
      console.error("Error creating path:", error);
    }
  };

  // Handle selecting an item type from the click menu
  const handleSelectItemType = (type) => {
    if (!clickPosition) return;
    
    setShowClickMenu(false);
    setEditMode(type);
    setNewItem(clickPosition);
    
    // Initialize form data with the click position
    setFormData({ 
      ...formData, 
      latitude: clickPosition.lat, 
      longitude: clickPosition.lng 
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      
      if (editMode === "building") {
        response = await axios.post('/api/buildings', formData);
        setBuildings([...buildings, response.data]);
      } else if (editMode === "entrance") {
        response = await axios.post('/api/entrances', formData);
        setEntrances([...entrances, response.data]);
      } else if (editMode === "obstacle") {
        response = await axios.post('/api/obstacles', formData);
        setObstacles([...obstacles, response.data]);
      } else if (editMode === "pathNode") {
        // You would need to create a new API endpoint for path nodes
        // response = await axios.post('/api/pathnodes', formData);
        // For now, just store in local state
        const newNode = {
          id: Date.now(), // Temporary ID
          latitude: formData.latitude,
          longitude: formData.longitude
        };
        setPathNodes([...pathNodes, newNode]);
      }
      
      // Reset form and edit mode
      setFormData({});
      setNewItem(null);
      setEditMode("view");
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };
  
  // Handle item deletion
  const handleDelete = async () => {
    if (!selectedItem) return;
    
    try {
      if (editMode === "building") {
        await axios.delete(`/api/buildings/${selectedItem.building_id}`);
        setBuildings(buildings.filter(b => b.building_id !== selectedItem.building_id));
      } else if (editMode === "entrance") {
        await axios.delete(`/api/entrances/${selectedItem.entrance_id}`);
        setEntrances(entrances.filter(e => e.entrance_id !== selectedItem.entrance_id));
      } else if (editMode === "path") {
        await axios.delete(`/api/paths/${selectedItem.path_id}`);
        setPaths(paths.filter(p => p.path_id !== selectedItem.path_id));
      } else if (editMode === "obstacle") {
        await axios.delete(`/api/obstacles/${selectedItem.obstacle_id}`);
        setObstacles(obstacles.filter(o => o.obstacle_id !== selectedItem.obstacle_id));
      } else if (editMode === "pathNode") {
        // Handle path node deletion
        // You would need to also delete any paths connected to this node
        setPathNodes(pathNodes.filter(n => n.id !== selectedItem.id));
      }
      
      setSelectedItem(null);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Enter connect mode
  const handleStartConnect = () => {
    if (selectedItem && editMode === "pathNode") {
      setConnectMode(true);
      setSourceNode(selectedItem);
      setSelectedItem(null); // Close info window
    }
  };

  // Cancel current operation
  const handleCancel = () => {
    setEditMode("view");
    setNewItem(null);
    setSelectedItem(null);
    setFormData({});
    setConnectMode(false);
    setSourceNode(null);
    setShowClickMenu(false);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="map-editor">
      <div className="editor-header">
        <h2>Campus Map Editor</h2>
        <div className="edit-controls">
          <button onClick={handleCancel}>
            Cancel / Reset
          </button>
          {connectMode && (
            <div className="connect-mode-indicator">
              Connect Mode: Select a target node
            </div>
          )}
          <div className="camera-controls">
            <div className="control-group">
                <label htmlFor="tilt-slider">Tilt: {cameraTilt}°</label>
                <input
                id="tilt-slider"
                type="range"
                min="0"
                max="45"
                value={cameraTilt}
                onChange={(e) => setCameraTilt(Number(e.target.value))}
                />
            </div>
            
            <div className="control-group">
                <label htmlFor="heading-slider">Rotation: {cameraHeading}°</label>
                <input
                id="heading-slider"
                type="range"
                min="0"
                max="360"
                value={cameraHeading}
                onChange={(e) => setCameraHeading(Number(e.target.value))}
                />
            </div>
            
            <button onClick={() => { setCameraTilt(0); setCameraHeading(0); }}>
                Reset View
            </button>
            </div>
        </div>
      </div>
      
      <div className="editor-main">
        <div className="map-container">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={17}
            center={center}
            options={options}
            onClick={handleMapClick}
            onLoad={onMapLoad}
          >
            {/* Display Buildings */}
            {buildings.map(building => (
              <Marker
                key={building.building_id}
                position={{ lat: building.latitude, lng: building.longitude }}
                icon={{
                  url: '/icons/building.png',
                  scaledSize: new window.google.maps.Size(30, 30)
                }}
                onClick={() => {
                  setSelectedItem(building);
                  setFormData(building);
                  setEditMode("building");
                }}
              />
            ))}
            
            {/* Display Entrances */}
            {entrances.map(entrance => (
              <Marker
                key={entrance.entrance_id}
                position={{ lat: entrance.latitude, lng: entrance.longitude }}
                icon={{
                  url: entrance.wheelchair_accessible ? 
                    '/icons/accessible_entrance.png' : 
                    '/icons/entrance.png',
                  scaledSize: new window.google.maps.Size(24, 24)
                }}
                onClick={() => {
                  setSelectedItem(entrance);
                  setEditMode("entrance");
                }}
              />
            ))}
            
            {/* Display Path Nodes */}
            {pathNodes.map(node => (
              <Marker
                key={node.id}
                position={{ lat: node.latitude, lng: node.longitude }}
                icon={{
                  url: '/icons/node.png', // You'll need this icon
                  scaledSize: new window.google.maps.Size(16, 16)
                }}
                onClick={() => {
                  if (connectMode && sourceNode) {
                    // If in connect mode, create a connection
                    createPathBetweenNodes(sourceNode, node);
                    setConnectMode(false);
                    setSourceNode(null);
                  } else {
                    setSelectedItem(node);
                    setEditMode("pathNode");
                  }
                }}
              />
            ))}
            
            {/* Display Paths */}
            {paths.map(path => {
              // Find the start and end nodes
              const startNode = pathNodes.find(n => n.id === path.start_location_id);
              const endNode = pathNodes.find(n => n.id === path.end_location_id);
              
              if (!startNode || !endNode) return null;
              
              return (
                <Polyline
                  key={path.path_id}
                  path={[
                    { lat: startNode.latitude, lng: startNode.longitude },
                    { lat: endNode.latitude, lng: endNode.longitude }
                  ]}
                  options={{
                    strokeColor: path.is_wheelchair_accessible ? '#6C63FF' : '#FE5E41',
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                  }}
                  onClick={() => {
                    setSelectedItem(path);
                    setEditMode("path");
                  }}
                />
              );
            })}
            
            {/* Display Obstacles */}
            {obstacles.map(obstacle => (
              <Marker
                key={obstacle.obstacle_id}
                position={{ lat: obstacle.latitude, lng: obstacle.longitude }}
                icon={{
                  url: '/icons/warning.png',
                  scaledSize: new window.google.maps.Size(24, 24)
                }}
                onClick={() => {
                  setSelectedItem(obstacle);
                  setEditMode("obstacle");
                }}
              />
            ))}
            
            {/* Display new item being added */}
            {newItem && (
              <Marker
                position={{ lat: newItem.lat, lng: newItem.lng }}
                icon={{
                  url: editMode === "building" ? '/icons/building.png' :
                       editMode === "entrance" ? '/icons/entrance.png' :
                       editMode === "pathNode" ? '/icons/node.png' :
                       '/icons/warning.png',
                  scaledSize: new window.google.maps.Size(24, 24)
                }}
              />
            )}
            
            {/* Click Menu Info Window */}
            {showClickMenu && clickPosition && (
              <InfoWindow
                position={clickPosition}
                onCloseClick={() => setShowClickMenu(false)}
              >
                <div className="click-menu">
                  <h3>Add New Item</h3>
                  <div className="click-menu-buttons">
                    <button onClick={() => handleSelectItemType("building")}>Building</button>
                    <button onClick={() => handleSelectItemType("entrance")}>Entrance</button>
                    <button onClick={() => handleSelectItemType("pathNode")}>Path Node</button>
                    <button onClick={() => handleSelectItemType("obstacle")}>Obstacle</button>
                  </div>
                </div>
              </InfoWindow>
            )}
            
            {/* Info Window for selected item */}
            {selectedItem && (
              <InfoWindow
                position={{ 
                  lat: selectedItem.latitude || selectedItem.lat, 
                  lng: selectedItem.longitude || selectedItem.lng
                }}
                onCloseClick={() => setSelectedItem(null)}
              >
                <div>
                  <h3>{selectedItem.name || "Selected Item"}</h3>
                  
                  {editMode === "building" && (
                    <p>{selectedItem.address + " " + selectedItem.street}</p>
                  )}
                  
                  {editMode === "entrance" && (
                    <p>Entrance to {buildings.find(b => b.building_id === selectedItem.building_id)?.name || "Unknown Building"}</p>
                  )}
                  
                  {editMode === "obstacle" && (
                    <p>{selectedItem.description}</p>
                  )}
                  
                  {editMode === "pathNode" && (
                    <button onClick={handleStartConnect}>Connect to another node</button>
                  )}
                  
                  <button onClick={handleDelete}>Delete</button>
                </div>
              </InfoWindow>
            )}
            
            {/* Source Node indicator in connect mode */}
            {connectMode && sourceNode && (
              <InfoWindow
                position={{ lat: sourceNode.latitude, lng: sourceNode.longitude }}
              >
                <div>
                  <p>Source Node Selected</p>
                  <button onClick={() => { setConnectMode(false); setSourceNode(null); }}>
                    Cancel
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
        
        <div className="editor-form">
          {(editMode !== "view" && newItem) && (
            <form onSubmit={handleSubmit}>
              <h3>{editMode === "building" ? "Building Details" :
                   editMode === "entrance" ? "Entrance Details" :
                   editMode === "pathNode" ? "Path Node Details" :
                   "Obstacle Details"}
              </h3>
              
              {/* Building Form Fields */}
              {editMode === "building" && (
                <>
                  <div className="form-group">
                    <label htmlFor="name">Building Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address">Building Number</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="street">Street</label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={formData.street || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city || "Marietta"}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state || "GA"}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="zip_code">Zip Code</label>
                    <input
                      type="text"
                      id="zip_code"
                      name="zip_code"
                      value={formData.zip_code || "30060"}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}
              
              {/* Entrance Form Fields */}
              {editMode === "entrance" && (
                <>
                  <div className="form-group">
                    <label htmlFor="entrance_name">Entrance Name</label>
                    <input
                      type="text"
                      id="entrance_name"
                      name="entrance_name"
                      value={formData.entrance_name || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="building_id">Building</label>
                    <select
                      id="building_id"
                      name="building_id"
                      value={formData.building_id || ""}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a Building</option>
                      {buildings.map(building => (
                        <option key={building.building_id} value={building.building_id}>
                          {building.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="floor_level">Floor Level</label>
                    <input
                      type="number"
                      id="floor_level"
                      name="floor_level"
                      value={formData.floor_level || 1}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group checkbox">
                    <input
                      type="checkbox"
                      id="wheelchair_accessible"
                      name="wheelchair_accessible"
                      checked={formData.wheelchair_accessible || false}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="wheelchair_accessible">Wheelchair Accessible</label>
                  </div>
                </>
              )}
              
              {/* Path Node Form Fields */}
              {editMode === "pathNode" && (
                <>
                  <div className="form-group">
                    <label htmlFor="node_name">Node Name (Optional)</label>
                    <input
                      type="text"
                      id="node_name"
                      name="node_name"
                      value={formData.node_name || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <p className="form-help">
                    After creating nodes, select one and click "Connect" to create paths between them.
                  </p>
                </>
              )}
              
              {/* Obstacle Form Fields */}
              {editMode === "obstacle" && (
                <>
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="severity_level">Severity Level</label>
                    <select
                      id="severity_level"
                      name="severity_level"
                      value={formData.severity_level || ""}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Severity</option>
                      <option value="1">Low</option>
                      <option value="2">Medium</option>
                      <option value="3">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status || ""}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </>
              )}
              
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {selectedItem ? "Update" : "Save"}
                </button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          )}
          
          {/* Path Form (when connecting nodes) */}
          {connectMode && sourceNode && (
            <div className="connection-form">
              <h3>Path Properties</h3>
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="had_incline"
                  name="had_incline"
                  checked={formData.had_incline || false}
                  onChange={handleInputChange}
                />
                <label htmlFor="had_incline">Has Incline</label>
              </div>
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="has_stairs"
                  name="has_stairs"
                  checked={formData.has_stairs || false}
                  onChange={handleInputChange}
                />
                <label htmlFor="has_stairs">Has Stairs</label>
              </div>
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="is_wheelchair_accessible"
                  name="is_wheelchair_accessible"
                  checked={formData.is_wheelchair_accessible || false}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_wheelchair_accessible">Wheelchair Accessible</label>
              </div>
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="is_paved"
                  name="is_paved"
                  checked={formData.is_paved || true}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_paved">Is Paved</label>
              </div>
              <p>Click on a target node to create a connection</p>
              <button onClick={() => { setConnectMode(false); setSourceNode(null); }}>
                Cancel Connection
              </button>
            </div>
          )}
        </div>
      </div>
      <DataViewer />
    </div>
  );
}

export default MapEditor;