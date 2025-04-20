import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import '../styles/MapEditor.css';
import DataViewer from './DataViewer';
import {
  fetchBuildings, createBuilding, deleteBuilding,
  fetchEntrances, createEntrance, deleteEntrance,
  fetchPaths, createPath, deletePath,
  fetchObstacles, createObstacle, deleteObstacle
} from '../mobile/services/mapService'; // Adjust path if needed

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

  // Update options based on state
  const options = React.useMemo(() => ({
    disableDefaultUI: false,
    zoomControl: true,
    mapId: '481d275839837ca8', // Consider moving Map ID to env variable
    tilt: cameraTilt,
    heading: cameraHeading
  }), [cameraTilt, cameraHeading]); // Recompute options when tilt/heading change

  // Fetch data from API using mapService
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use Promise.all for concurrent fetching
        const [
          buildingsData,
          entrancesData,
          pathsData,
          obstaclesData,
          // pathNodesData // Add when API exists
        ] = await Promise.all([
          fetchBuildings(),
          fetchEntrances(),
          fetchPaths(),
          fetchObstacles(),
          // fetchPathNodes() // Add when API exists
        ]);

        // Assuming service functions return the array directly
        setBuildings(buildingsData || []);
        console.log(buildingsData);
        setEntrances(entrancesData || []);
        console.log(entrancesData);
        setPaths(pathsData || []);
        console.log(pathsData);
        setObstacles(obstaclesData || []);
        console.log(obstaclesData);
        // setPathNodes(pathNodesData || []); // Add when API exists

      } catch (error) {
        console.error("Error fetching initial data:", error);
        // Handle error state appropriately, maybe show a message to the user
      }
    };

    fetchData();
  }, []); // Fetch only on mount


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
  

  // Create a path between two nodes using mapService
  const createPathBetweenNodes = async (source, target) => {
    try {
      const pathData = {
        start_location_id: source.id, // Assuming path nodes have an 'id'
        end_location_id: target.id,   // Assuming path nodes have an 'id'
        is_wheelchair_accessible: formData.is_wheelchair_accessible || false,
        has_stairs: formData.has_stairs || false,
        had_incline: formData.had_incline || false, // Match backend schema if needed
        is_paved: formData.is_paved || true,
        distance: calculateDistance(
          { lat: source.latitude, lng: source.longitude },
          { lat: target.latitude, lng: target.longitude }
        )
      };

      // --- Use mapService function ---
      const newPath = await createPath(pathData);
      setPaths([...paths, newPath]);

      // Reset form data
      setFormData({});

    } catch (error) {
      console.error("Error creating path:", error);
      // Handle error (e.g., show message to user)
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

  // Submit form data using mapService
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let newItemData;

      switch (editMode) {
        case "building":
          newItemData = await createBuilding(formData);
          setBuildings([...buildings, newItemData]);
          break;
        case "entrance":
          newItemData = await createEntrance(formData);
          setEntrances([...entrances, newItemData]);
          break;
        case "obstacle":
          newItemData = await createObstacle(formData);
          setObstacles([...obstacles, newItemData]);
          break;
        case "pathNode":
          // --- Use mapService function when available ---
          // newItemData = await createPathNode(formData);
          // setPathNodes([...pathNodes, newItemData]);
          // --- Temporary local state update ---
          const newNode = {
            id: Date.now(), // Temporary ID, backend should assign real one
            latitude: formData.latitude,
            longitude: formData.longitude,
            // Add other properties if needed
          };
          setPathNodes([...pathNodes, newNode]);
          // --- End Temporary ---
          break;
        default:
          console.warn("Unknown edit mode:", editMode);
          return;
      }

      // Reset form and edit mode
      setFormData({});
      setNewItem(null);
      setEditMode("view");
    } catch (error) {
      console.error(`Error saving ${editMode}:`, error);
      // Handle error (e.g., show message to user)
    }
  };

  

  // Handle item deletion using mapService
  const handleDelete = async () => {
    if (!selectedItem) return;

    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete this ${editMode}?`)) {
        return;
    }

    try {
      switch (editMode) {
        case "building":
          await deleteBuilding(selectedItem.building_id);
          setBuildings(buildings.filter(b => b.building_id !== selectedItem.building_id));
          break;
        case "entrance":
          await deleteEntrance(selectedItem.entrance_id);
          setEntrances(entrances.filter(e => e.entrance_id !== selectedItem.entrance_id));
          break;
        case "path":
          await deletePath(selectedItem.path_id);
          setPaths(paths.filter(p => p.path_id !== selectedItem.path_id));
          break;
        case "obstacle":
          await deleteObstacle(selectedItem.obstacle_id);
          setObstacles(obstacles.filter(o => o.obstacle_id !== selectedItem.obstacle_id));
          break;
        case "pathNode":
          // --- Use mapService function when available ---
          // await deletePathNode(selectedItem.id);
          // --- Temporary local state update ---
          // TODO: Also delete paths connected to this node from backend/state
          setPathNodes(pathNodes.filter(n => n.id !== selectedItem.id));
          // --- End Temporary ---
          break;
        default:
          console.warn("Unknown edit mode for deletion:", editMode);
          return;
      }

      setSelectedItem(null);
      setEditMode("view"); // Go back to view mode after deletion
      setFormData({});
    } catch (error) {
      console.error(`Error deleting ${editMode}:`, error);
      // Handle error (e.g., show message to user)
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
                max="45" // Max tilt for satellite view
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
            mapTypeId="satellite" // Use satellite view for better context
          >
            {/* Display Buildings */}
            {buildings.map(building => (
              <Marker
                key={`bldg-${building.building_id}`}
                position={{ lat: building.latitude, lng: building.longitude }}
                // icon={{ /* ... building icon ... */ }}
                title={building.name}
                onClick={() => {
                  setSelectedItem(building);
                  setFormData(building); // Pre-fill form for editing
                  setEditMode("building");
                  setShowClickMenu(false); // Close click menu if open
                  setNewItem(null); // Clear new item marker
                }}
              />
            ))}

            {/* Display Entrances */}
            {entrances.map(entrance => (
              <Marker
                key={`ent-${entrance.entrance_id}`}
                position={{ lat: entrance.latitude, lng: entrance.longitude }}
                // icon={{ /* ... entrance icon ... */ }}
                title={entrance.entrance_name}
                onClick={() => {
                  setSelectedItem(entrance);
                  setFormData(entrance); // Pre-fill form
                  setEditMode("entrance");
                  setShowClickMenu(false);
                  setNewItem(null);
                }}
              />
            ))}

            {/* Display Path Nodes */}
            {pathNodes.map(node => (
              <Marker
                key={`node-${node.id}`} // Use node ID
                position={{ lat: node.latitude, lng: node.longitude }}
                icon={{ // Simple circle icon for nodes
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 5,
                    fillColor: '#FFFF00', // Yellow
                    fillOpacity: 1,
                    strokeColor: '#000000',
                    strokeWeight: 1,
                }}
                title={`Node ${node.id}`}
                onClick={() => {
                  if (connectMode && sourceNode) {
                    // If in connect mode, create a connection
                    createPathBetweenNodes(sourceNode, node);
                    setConnectMode(false);
                    setSourceNode(null);
                  } else {
                    setSelectedItem(node);
                    setFormData(node); // Pre-fill form
                    setEditMode("pathNode");
                    setShowClickMenu(false);
                    setNewItem(null);
                  }
                }}
              />
            ))}

            {/* Display Paths */}
            {paths.map(path => {
              // Find the start and end nodes
              // TODO: Need a reliable way to get node coordinates (API or local state)
              const startNode = pathNodes.find(n => n.id === path.start_location_id);
              const endNode = pathNodes.find(n => n.id === path.end_location_id);

              if (!startNode || !endNode) return null; // Don't render if nodes aren't found

              return (
                <Polyline
                  key={`path-${path.path_id}`}
                  path={[
                    { lat: startNode.latitude, lng: startNode.longitude },
                    { lat: endNode.latitude, lng: endNode.longitude }
                  ]}
                  options={{
                    strokeColor: path.is_wheelchair_accessible ? '#6C63FF' : '#FE5E41',
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                    zIndex: 1 // Render paths below markers
                  }}
                  onClick={() => {
                    setSelectedItem(path);
                    setFormData(path); // Pre-fill form
                    setEditMode("path");
                    setShowClickMenu(false);
                    setNewItem(null);
                  }}
                />
              );
            })}

            {/* Display Obstacles */}
            {obstacles.map(obstacle => (
              // Ensure obstacles have lat/lng before rendering
              (typeof obstacle.latitude === 'number' && typeof obstacle.longitude === 'number') && (
                <Marker
                  key={`obs-${obstacle.obstacle_id}`}
                  position={{ lat: obstacle.latitude, lng: obstacle.longitude }}
                  // icon={{ /* ... obstacle icon ... */ }}
                  title={obstacle.description}
                  onClick={() => {
                    setSelectedItem(obstacle);
                    setFormData(obstacle); // Pre-fill form
                    setEditMode("obstacle");
                    setShowClickMenu(false);
                    setNewItem(null);
                  }}
                />
              )
            ))}

            {/* Display new item being added */}
            {newItem && (
              <Marker
                position={{ lat: newItem.lat, lng: newItem.lng }}
                // icon={{ /* ... icon based on editMode ... */ }}
                draggable={true} // Allow dragging the new item marker
                onDragEnd={(e) => {
                    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                    setNewItem(newPos);
                    setFormData(prev => ({ ...prev, latitude: newPos.lat, longitude: newPos.lng }));
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
                  <h3>Add New Item Here</h3>
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
                  lat: selectedItem.latitude, // Assuming consistent naming now
                  lng: selectedItem.longitude
                }}
                onCloseClick={() => { setSelectedItem(null); setEditMode("view"); setFormData({}); }}
              >
                <div>
                  <h3>{selectedItem.name || selectedItem.entrance_name || selectedItem.description || `Item ${selectedItem.id || selectedItem.building_id || selectedItem.entrance_id || selectedItem.path_id || selectedItem.obstacle_id}`}</h3>

                  {/* Display relevant details based on type */}
                  {editMode === "building" && <p>{selectedItem.address} {selectedItem.street}</p>}
                  {editMode === "entrance" && <p>Building ID: {selectedItem.building_id}, Accessible: {selectedItem.wheelchair_accessible ? 'Yes' : 'No'}</p>}
                  {editMode === "path" && <p>Distance: {selectedItem.distance?.toFixed(1)}m, Accessible: {selectedItem.is_wheelchair_accessible ? 'Yes' : 'No'}</p>}
                  {editMode === "obstacle" && <p>Severity: {selectedItem.severity_level}, Status: {selectedItem.status}</p>}
                  {editMode === "pathNode" && <p>Node ID: {selectedItem.id}</p>}

                  {/* Actions */}
                  <div className="info-actions">
                      {editMode === "pathNode" && !connectMode && (
                          <button onClick={handleStartConnect}>Connect Path</button>
                      )}
                      <button onClick={handleDelete} style={{ backgroundColor: '#E74C3C', color: 'white' }}>Delete</button>
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* Source Node indicator in connect mode */}
            {connectMode && sourceNode && (
              <InfoWindow
                position={{ lat: sourceNode.latitude, lng: sourceNode.longitude }}
                onCloseClick={() => { setConnectMode(false); setSourceNode(null); }} // Allow closing
              >
                <div>
                  <p>Connecting from Node {sourceNode.id}. Click target node.</p>
                  <button onClick={() => { setConnectMode(false); setSourceNode(null); }}>
                    Cancel Connection
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>

        <div className="editor-form">
          {/* Form for adding/editing items */}
          {(editMode !== "view" && (newItem || selectedItem)) && (
            <form onSubmit={handleSubmit}>
              <h3>
                {selectedItem ? `Edit ${editMode}` : `Add New ${editMode}`}
              </h3>

              {/* Common Lat/Lng fields */}
              <div className="form-group">
                <label>Latitude</label>
                <input type="number" step="any" name="latitude" value={formData.latitude || ''} onChange={handleInputChange} required readOnly={!newItem} />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input type="number" step="any" name="longitude" value={formData.longitude || ''} onChange={handleInputChange} required readOnly={!newItem} />
              </div>

              {/* Building Form Fields */}
              {editMode === "building" && (
                <>
                  <div className="form-group">
                    <label htmlFor="name">Building Name</label>
                    <input type="text" id="name" name="name" value={formData.name || ""} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address">Building Number</label>
                    <input type="text" id="address" name="address" value={formData.address || ""} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="street">Street</label>
                    <input type="text" id="street" name="street" value={formData.street || ""} onChange={handleInputChange} />
                  </div>
                  {/* Add City, State, Zip if needed */}
                </>
              )}

              {/* Entrance Form Fields */}
              {editMode === "entrance" && (
                <>
                  <div className="form-group">
                    <label htmlFor="entrance_name">Entrance Name</label>
                    <input type="text" id="entrance_name" name="entrance_name" value={formData.entrance_name || ""} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="building_id">Building</label>
                    <select id="building_id" name="building_id" value={formData.building_id || ""} onChange={handleInputChange} required>
                      <option value="">Select a Building</option>
                      {buildings.map(building => (
                        <option key={building.building_id} value={building.building_id}>
                          {building.name} (ID: {building.building_id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="floor_level">Floor Level</label>
                    <input type="number" id="floor_level" name="floor_level" value={formData.floor_level || 1} onChange={handleInputChange} />
                  </div>
                  <div className="form-group checkbox">
                    <input type="checkbox" id="wheelchair_accessible" name="wheelchair_accessible" checked={formData.wheelchair_accessible || false} onChange={handleInputChange} />
                    <label htmlFor="wheelchair_accessible">Wheelchair Accessible</label>
                  </div>
                </>
              )}

              {/* Path Node Form Fields */}
              {editMode === "pathNode" && (
                <>
                  <div className="form-group">
                    <label htmlFor="node_name">Node Name (Optional)</label>
                    <input type="text" id="node_name" name="node_name" value={formData.node_name || ""} onChange={handleInputChange} />
                  </div>
                  <p className="form-help">
                    {selectedItem ? 'Click "Connect Path" in InfoWindow to start.' : 'Save node first, then select it to connect.'}
                  </p>
                </>
              )}

              {/* Obstacle Form Fields */}
              {editMode === "obstacle" && (
                <>
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" value={formData.description || ""} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="severity_level">Severity Level</label>
                    <select id="severity_level" name="severity_level" value={formData.severity_level || ""} onChange={handleInputChange} required>
                      <option value="">Select Severity</option>
                      <option value="1">Low</option>
                      <option value="2">Medium</option>
                      <option value="3">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select id="status" name="status" value={formData.status || "Pending"} onChange={handleInputChange} required>
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  {/* Add fields for associating obstacle with building/path/entrance if needed */}
                </>
              )}

              {/* Path Form Fields (Only show when connecting) */}
              {connectMode && sourceNode && (
                  <div className="connection-form">
                    <h4>Path Properties (for new connection)</h4>
                    <div className="form-group checkbox">
                      <input type="checkbox" id="had_incline" name="had_incline" checked={formData.had_incline || false} onChange={handleInputChange} />
                      <label htmlFor="had_incline">Has Incline</label>
                    </div>
                    <div className="form-group checkbox">
                      <input type="checkbox" id="has_stairs" name="has_stairs" checked={formData.has_stairs || false} onChange={handleInputChange} />
                      <label htmlFor="has_stairs">Has Stairs</label>
                    </div>
                    <div className="form-group checkbox">
                      <input type="checkbox" id="is_wheelchair_accessible" name="is_wheelchair_accessible" checked={formData.is_wheelchair_accessible === undefined ? true : formData.is_wheelchair_accessible} onChange={handleInputChange} />
                      <label htmlFor="is_wheelchair_accessible">Wheelchair Accessible</label>
                    </div>
                    <div className="form-group checkbox">
                      <input type="checkbox" id="is_paved" name="is_paved" checked={formData.is_paved === undefined ? true : formData.is_paved} onChange={handleInputChange} />
                      <label htmlFor="is_paved">Is Paved</label>
                    </div>
                    <p>Click on a target node to create the connection.</p>
                  </div>
              )}


              {/* Don't show save/cancel if only connecting */}
              {!connectMode && (
                  <div className="form-actions">
                    <button type="submit" className="save-btn">
                      {selectedItem ? "Update" : "Save"} {editMode}
                    </button>
                    <button type="button" className="cancel-btn" onClick={handleCancel}>
                      Cancel
                    </button>
                  </div>
              )}
            </form>
          )}

          {/* Placeholder when not editing */}
          {editMode === "view" && !newItem && !selectedItem && !connectMode && (
            <div className="form-placeholder">
              <p>Click on the map to add a new item, or click an existing item to edit.</p>
            </div>
          )}
        </div>
      </div>
      {/* Optionally include DataViewer for reference */}
      <DataViewer
        buildings={buildings}
        entrances={entrances}
        paths={paths}
        obstacles={obstacles}
      />
    </div>
  );
}

export default MapEditor;