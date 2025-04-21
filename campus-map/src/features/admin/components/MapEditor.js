import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api'; // Removed Polyline
import './MapEditor.css';
import DataViewer from '../../data/components/DataViewer';

// --- Refactored Service Imports ---
// Import specific functions from their respective service files (assuming they exist/will exist)
// For now, keep mapService but ideally split these out
import {
  fetchBuildings, createBuilding, updateBuilding, deleteBuilding,
  fetchEntrances, createEntrance, updateEntrance, deleteEntrance,
  fetchAccessibilityFeatures, createAccessibilityFeature, updateAccessibilityFeature, deleteAccessibilityFeature,
  fetchObstacles, createObstacle, updateObstacle, deleteObstacle,
} from '../../../services/mapService'; // TODO: Split into buildingService, entranceService, etc.

// Import parking service
import {
    fetchParkingLots, createParkingLot, updateParkingLot, deleteParkingLot
} from '../../../services/parkingService'; // Import parking functions

// --- Import the new icon function ---
import { getMapIcon } from '../../../components/icons/mapIcons'; // Adjust path if needed


const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "600px",
};
const center = {
  lat: 33.9386, // KSU Marietta Campus center
  lng: -84.5187,
};

// --- Helper: MapItemMarker Component ---
// --- Helper: MapItemMarker Component (Updated) ---
const MapItemMarker = ({ item, type, onClick }) => { // Removed iconProps
  let position, title, key;
  const itemId = item.feature_id || item.id || item.building_id || item.entrance_id || item.obstacle_id || item.lot_id;

  switch (type) {
    case 'building':
      position = { lat: item.latitude, lng: item.longitude };
      title = item.name;
      key = `bldg-${itemId}`;
      break;
    case 'entrance':
      position = { lat: item.latitude, lng: item.longitude };
      title = item.entrance_name;
      key = `ent-${itemId}`;
      break;
    case 'obstacle':
      position = { lat: item.latitude, lng: item.longitude };
      title = item.description;
      key = `obs-${itemId}`;
      break;
    case 'parkingLot':
        position = { lat: item.latitude, lng: item.longitude };
        title = item.name;
        key = `lot-${itemId}`;
        break;
    case 'accessibilityFeature':
        position = { lat: item.latitude, lng: item.longitude };
        title = `${item.feature_type}: ${item.description || 'Feature'}`;
        key = `acc-${itemId}`; // Assuming primary key is feature_id
        break;
    default:
      console.warn(`Unknown item type for marker: ${type}`);
      return null;
  }

  // Ensure position is valid before rendering
  if (typeof position?.lat !== 'number' || typeof position?.lng !== 'number') {
    console.warn(`Invalid coordinates for ${type} item:`, item);
    return null;
  }

  // --- Get the icon from the centralized function ---
  const iconConfig = getMapIcon(type);
  // --------------------------------------------------

  return (
    <Marker
      key={key}
      position={position}
      title={title}
      icon={iconConfig} // Use the retrieved icon config
      onClick={() => onClick(item, type)}
      zIndex={type === 'building' ? 1 : 2} // Example: Keep buildings below other markers
    />
  );
};

// --- Helper: InfoWindowContent Component ---
const InfoWindowContent = ({ item, type, onDelete }) => {
    let title, details;
    // Use || operator chain for ID
    const itemId = item.feature_id || item.id || item.building_id || item.entrance_id || item.obstacle_id || item.lot_id;

    switch (type) {
        case "building":
            title = item.name;
            details = <p>{item.address} {item.street}</p>;
            break;
        case "entrance":
            title = item.entrance_name;
            details = <p>Building ID: {item.building_id}, Accessible: {item.wheelchair_accessible ? 'Yes' : 'No'}</p>;
            break;
        case "obstacle":
            title = item.description;
            details = <p>Severity: {item.severity_level}, Status: {item.status}</p>;
            break;
        case "parkingLot":
            title = item.name;
            details = (
                <>
                    <p>Permits: {item.permits?.join(', ') || 'N/A'}</p>
                    {item.capacity && <p>Capacity: {item.capacity}</p>}
                </>
            );
            break;
        case "accessibilityFeature":
            title = item.feature_type || "Accessibility Feature";
            details = (
                <>
                    <p>{item.description || "No description"}</p>
                    {item.building_id && <p>Building ID: {item.building_id}</p>}
                    {/* Add other relevant details */}
                </>
            );
            break;
        default:
            title = `Item ${itemId}`;
            details = <p>Unknown item type.</p>;
    }

    return (
        <div>
            <h3>{title}</h3>
            {details}
            <div className="info-actions">
                <button onClick={() => onDelete(item, type)} style={{ backgroundColor: '#E74C3C', color: 'white' }}>Delete</button>
            </div>
        </div>
    );
};


// --- Main MapEditor Component ---
function MapEditor() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // State for map data
  const [buildings, setBuildings] = useState([]);
  const [entrances, setEntrances] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [parkingLots, setParkingLots] = useState([]);
  const [accessibilityFeatures, setAccessibilityFeatures] = useState([]); // New state


  // Editor state
  const [selectedItem, setSelectedItem] = useState(null); // { item: data, type: 'building' | 'entrance' ... }
  const [editMode, setEditMode] = useState("view"); // view, building, entrance, obstacle, parkingLot
  const [newItemPosition, setNewItemPosition] = useState(null);

  // Camera Angle/Heading State
  const [cameraTilt, setCameraTilt] = useState(0);
  const [cameraHeading, setCameraHeading] = useState(0);

  // Click state
  const [clickPosition, setClickPosition] = useState(null);
  const [showClickMenu, setShowClickMenu] = useState(false);

  // Form state
  const [formData, setFormData] = useState({});

  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const options = useMemo(() => ({
    disableDefaultUI: false,
    zoomControl: true,
    mapId: process.env.REACT_APP_GOOGLE_MAP_ID || '481d275839837ca8',
    tilt: cameraTilt,
    heading: cameraHeading,
    mapTypeId: "satellite",
  }), [cameraTilt, cameraHeading]);

  // --- Refactored Service Actions Mapping ---
  const serviceActions = useMemo(() => ({
    building: { fetch: fetchBuildings, create: createBuilding, update: updateBuilding, delete: deleteBuilding, idField: 'building_id' },
    entrance: { fetch: fetchEntrances, create: createEntrance, update: updateEntrance, delete: deleteEntrance, idField: 'entrance_id' },
    obstacle: { fetch: fetchObstacles, create: createObstacle, update: updateObstacle, delete: deleteObstacle, idField: 'obstacle_id' },
    parkingLot: { fetch: fetchParkingLots, create: createParkingLot, update: updateParkingLot, delete: deleteParkingLot, idField: 'lot_id' },
    accessibilityFeature: { fetch: fetchAccessibilityFeatures, create: createAccessibilityFeature, update: updateAccessibilityFeature, delete: deleteAccessibilityFeature, idField: 'feature_id' },

  }), []);

  // --- Refactored Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled(
          Object.entries(serviceActions).map(([type, actions]) =>
            actions.fetch().then(data => ({ type, data: data || [] }))
          )
        );

        results.forEach(result => {
          if (result.status === 'fulfilled') {
            const { type, data } = result.value;
            switch (type) {
              case 'building': setBuildings(data); break;
              case 'entrance': setEntrances(data); break;
              case 'obstacle': setObstacles(data); break;
              case 'parkingLot': setParkingLots(data); break;
              case 'accessibilityFeature': setAccessibilityFeatures(data); break;
              default: break;
            }
            console.log(`Fetched ${type} data:`, data);
          } else {
            console.error(`Error fetching data for ${result.reason?.config?.url || 'unknown type'}:`, result.reason);
          }
        });

      } catch (error) {
        console.error("Error during initial data fetch:", error);
      }
    };

    fetchData();
  }, [serviceActions]);

  // --- Map Click Handler (simplified, removed connectMode logic) ---
  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    if (editMode === 'view') { // Only show click menu in view mode
        setClickPosition({ lat, lng });
        setShowClickMenu(true);
        setSelectedItem(null);
        setNewItemPosition(null);
    } else {
        // If already in an edit mode (e.g., placing a new item), update position
        if (newItemPosition) {
            setNewItemPosition({ lat, lng });
            setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        }
    }
  };


  // --- Handle Selecting Item Type from Click Menu ---
  const handleSelectItemType = (type) => {
    if (!clickPosition) return;
    setShowClickMenu(false);
    setEditMode(type);
    setNewItemPosition(clickPosition);
    setSelectedItem(null);
    setFormData({
      latitude: clickPosition.lat,
      longitude: clickPosition.lng,
    });
  };

  // --- Handle Marker Click (simplified, removed connectMode logic) ---
  const handleMarkerClick = (item, type) => {
    // Select the item for viewing/editing
    setSelectedItem({ item, type });
    setFormData(item);
    setEditMode(type);
    setShowClickMenu(false);
    setNewItemPosition(null);
  };

  // --- Handle Form Input Changes (Unchanged) ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'permits') {
        setFormData({
            ...formData,
            [name]: value.split(',').map(p => p.trim()).filter(p => p),
        });
    } else {
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    }
  };

  // --- Refactored Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editMode || editMode === 'view') return;

    const actions = serviceActions[editMode];
    if (!actions) {
      console.error("Invalid edit mode:", editMode);
      return;
    }

    try {
      let result;
      const currentItem = selectedItem?.item;

      if (currentItem) {
        // --- Update Existing Item ---
        const itemId = currentItem[actions.idField];
        if (!itemId) {
            console.error("Cannot update item without ID:", currentItem);
            return;
        }
        const updateData = { ...formData };
        if (updateData.latitude !== undefined) updateData.latitude = Number(updateData.latitude);
        if (updateData.longitude !== undefined) updateData.longitude = Number(updateData.longitude);

        result = await actions.update(itemId, updateData);
        const updateState = (setter) => setter(prev =>
          prev.map(item => item[actions.idField] === itemId ? result : item)
        );
        switch (editMode) {
          case 'building': updateState(setBuildings); break;
          case 'entrance': updateState(setEntrances); break;
          case 'obstacle': updateState(setObstacles); break;
          case 'parkingLot': updateState(setParkingLots); break;
          case 'accessibilityFeature': updateState(setAccessibilityFeatures); break;
          default: break;
        }
      } else {
        // --- Create New Item ---
        const createData = { ...formData };
        if (createData.latitude !== undefined) createData.latitude = Number(createData.latitude);
        if (createData.longitude !== undefined) createData.longitude = Number(createData.longitude);

        result = await actions.create(createData);
        const addState = (setter) => setter(prev => [...prev, result]);
        switch (editMode) {
          case 'building': addState(setBuildings); break;
          case 'entrance': addState(setEntrances); break;
          case 'obstacle': addState(setObstacles); break;
          case 'parkingLot': addState(setParkingLots); break;
          case 'accessibilityFeature': addState(setAccessibilityFeatures); break;
          default: break;
        }
      }
      console.log(`${currentItem ? 'Updated' : 'Created'} ${editMode}:`, result);
      handleCancel();
    } catch (error) {
      console.error(`Error saving ${editMode}:`, error);
      alert(`Failed to save ${editMode}: ${error.message || 'Unknown error'}`);
    }
  };

  // --- Refactored Item Deletion ---
  const handleDeleteItem = async (itemToDelete, typeToDelete) => {
    if (!itemToDelete || !typeToDelete) return;

    const actions = serviceActions[typeToDelete];
    const itemId = itemToDelete[actions?.idField];

    if (!actions || !itemId) {
        console.error("Cannot delete item without actions or ID:", itemToDelete, typeToDelete);
        return;
    }

    if (!window.confirm(`Are you sure you want to delete this ${typeToDelete} (ID: ${itemId})?`)) {
      return;
    }

    try {
      await actions.delete(itemId);
      const removeState = (setter) => setter(prev =>
        prev.filter(item => item[actions.idField] !== itemId)
      );
      switch (typeToDelete) {
        case 'building': removeState(setBuildings); break;
        case 'entrance': removeState(setEntrances); break;
        case 'obstacle': removeState(setObstacles); break;
        case 'parkingLot': removeState(setParkingLots); break;
        case 'accessibilityFeature': removeState(setAccessibilityFeatures); break;
        default: break;
      }
      console.log(`Deleted ${typeToDelete} (ID: ${itemId})`);
      handleCancel();
    } catch (error) {
      console.error(`Error deleting ${typeToDelete}:`, error);
      // --- Improved error handling for foreign key constraints ---
      // Check if the error message indicates a foreign key violation
      const errorMessage = error.message || '';
      if (errorMessage.includes('still referenced') || errorMessage.includes('foreign key constraint')) {
          alert(`Failed to delete ${typeToDelete}: It is still referenced by other items in the database.`);
      } else {
          alert(`Failed to delete ${typeToDelete}: ${errorMessage || 'Unknown error'}`);
      }
    }
  };

  // --- Removed handleStartConnect ---

  // --- Cancel / Reset ---
  const handleCancel = () => {
    setEditMode("view");
    setNewItemPosition(null);
    setSelectedItem(null);
    setFormData({});
    setShowClickMenu(false);
    setClickPosition(null);
  };

  if (loadError) return <div>Error loading maps: {loadError.message}</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  const currentItemData = selectedItem?.item;
  const currentItemType = selectedItem?.type;

  return (
    <div className="map-editor">
      <div className="editor-header">
        <h2>Campus Map Editor</h2>
        <div className="edit-controls">
          <button onClick={handleCancel}>
            Cancel / Reset View
          </button>
          <div className="camera-controls">
             <div className="control-group">
                <label htmlFor="tilt-slider">Tilt: {cameraTilt}°</label>
                <input id="tilt-slider" type="range" min="0" max="45" value={cameraTilt} onChange={(e) => setCameraTilt(Number(e.target.value))} />
            </div>
            <div className="control-group">
                <label htmlFor="heading-slider">Rotation: {cameraHeading}°</label>
                <input id="heading-slider" type="range" min="0" max="360" value={cameraHeading} onChange={(e) => setCameraHeading(Number(e.target.value))} />
            </div>
            <button onClick={() => { setCameraTilt(0); setCameraHeading(0); }}>Reset View</button>
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
            {/* --- Refactored Marker Rendering --- */}
            {buildings.map(item => <MapItemMarker key={`bldg-${item.building_id}`} item={item} type="building" onClick={handleMarkerClick} />)}
            {entrances.map(item => <MapItemMarker key={`ent-${item.entrance_id}`} item={item} type="entrance" onClick={handleMarkerClick} />)}
            {obstacles.map(item => <MapItemMarker key={`obs-${item.obstacle_id}`} item={item} type="obstacle" onClick={handleMarkerClick} />)}
            {parkingLots.map(item => <MapItemMarker key={`lot-${item.lot_id}`} item={item} type="parkingLot" onClick={handleMarkerClick} />)}
            {accessibilityFeatures.map(item => <MapItemMarker key={`acc-${item.feature_id}`} item={item} type="accessibilityFeature" onClick={handleMarkerClick} />)}

            {/* Display new item being added */}
            {newItemPosition && (
              <Marker
                position={newItemPosition}
                draggable={true}
                onDragEnd={(e) => {
                    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                    setNewItemPosition(newPos);
                    setFormData(prev => ({ ...prev, latitude: newPos.lat, longitude: newPos.lng }));
                }}
              />
            )}

            {/* Click Menu Info Window */}
            {showClickMenu && clickPosition && (
              <InfoWindow
                position={clickPosition}
                onCloseClick={handleCancel}
              >
                <div className="click-menu">
                  <h3>Add New Item Here</h3>
                  <div className="click-menu-buttons">
                    <button onClick={() => handleSelectItemType("building")}>Building</button>
                    <button onClick={() => handleSelectItemType("entrance")}>Entrance</button>
                    <button onClick={() => handleSelectItemType("obstacle")}>Obstacle</button>
                    <button onClick={() => handleSelectItemType("parkingLot")}>Parking Lot</button>
                    <button onClick={() => handleSelectItemType("accessibilityFeature")}>Accessibility</button>
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* Info Window for selected item */}
            {selectedItem && currentItemData && (
              <InfoWindow
                position={{ lat: Number(currentItemData.latitude), lng: Number(currentItemData.longitude) }}
                onCloseClick={handleCancel}
              >
                <InfoWindowContent
                    item={currentItemData}
                    type={currentItemType}
                    onDelete={handleDeleteItem} // Pass only onDelete
                />
              </InfoWindow>
            )}

          </GoogleMap>
        </div>

        {/* --- Editor Form Area --- */}
        <div className="editor-form">
          {(editMode !== "view" && (newItemPosition || selectedItem)) && (
            <form onSubmit={handleSubmit}>
              <h3>
                {selectedItem ? `Edit ${editMode}` : `Add New ${editMode}`}
              </h3>

              {/* Common Lat/Lng fields */}
              <div className="form-group">
                <label>Latitude</label>
                <input type="number" step="any" name="latitude" value={formData.latitude || ''} onChange={handleInputChange} required readOnly={!!selectedItem} />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input type="number" step="any" name="longitude" value={formData.longitude || ''} onChange={handleInputChange} required readOnly={!!selectedItem} />
              </div>

              {/* --- Conditional Form Fields --- */}

              {/* Building */}
              {editMode === "building" && (
                <>
                  <div className="form-group"><label htmlFor="name">Name</label><input type="text" id="name" name="name" value={formData.name || ""} onChange={handleInputChange} required /></div>
                  <div className="form-group"><label htmlFor="address">Address/Number</label><input type="text" id="address" name="address" value={formData.address || ""} onChange={handleInputChange} /></div>
                  <div className="form-group"><label htmlFor="street">Street</label><input type="text" id="street" name="street" value={formData.street || ""} onChange={handleInputChange} /></div>
                </>
              )}

              {/* Entrance */}
              {editMode === "entrance" && (
                <>
                  <div className="form-group"><label htmlFor="entrance_name">Name</label><input type="text" id="entrance_name" name="entrance_name" value={formData.entrance_name || ""} onChange={handleInputChange} required /></div>
                  <div className="form-group"><label htmlFor="building_id">Building</label>
                    <select id="building_id" name="building_id" value={formData.building_id || ""} onChange={handleInputChange} required>
                      <option value="">Select Building</option>
                      {buildings.map(b => <option key={b.building_id} value={b.building_id}>{b.name} (ID: {b.building_id})</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label htmlFor="floor_level">Floor</label><input type="number" id="floor_level" name="floor_level" value={formData.floor_level || 1} onChange={handleInputChange} /></div>
                  <div className="form-group checkbox"><input type="checkbox" id="wheelchair_accessible" name="wheelchair_accessible" checked={formData.wheelchair_accessible || false} onChange={handleInputChange} /><label htmlFor="wheelchair_accessible">Accessible</label></div>
                </>
              )}

              {/* Obstacle */}
              {editMode === "obstacle" && (
                <>
                  <div className="form-group"><label htmlFor="description">Description</label><textarea id="description" name="description" value={formData.description || ""} onChange={handleInputChange} required /></div>
                  <div className="form-group"><label htmlFor="severity_level">Severity</label>
                    <select id="severity_level" name="severity_level" value={formData.severity_level || ""} onChange={handleInputChange} required>
                      <option value="">Select</option><option value="1">Low</option><option value="2">Medium</option><option value="3">High</option>
                    </select>
                  </div>
                  <div className="form-group"><label htmlFor="status">Status</label>
                    <select id="status" name="status" value={formData.status || "Pending"} onChange={handleInputChange} required>
                      <option value="Pending">Pending</option><option value="Under Review">Review</option><option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </>
              )}

              {/* Parking Lot */}
              {editMode === "parkingLot" && (
                <>
                  <div className="form-group"><label htmlFor="name">Lot Name</label><input type="text" id="name" name="name" value={formData.name || ""} onChange={handleInputChange} required /></div>
                  <div className="form-group"><label htmlFor="permits">Permits (comma-separated)</label><input type="text" id="permits" name="permits" value={Array.isArray(formData.permits) ? formData.permits.join(', ') : (formData.permits || "")} onChange={handleInputChange} placeholder="e.g., Student, Visitor" /></div>
                  <div className="form-group"><label htmlFor="capacity">Capacity (Optional)</label><input type="number" id="capacity" name="capacity" value={formData.capacity || ""} onChange={handleInputChange} /></div>
                </>
              )}

              
              {/* --- Accessibility Feature Form Fields --- */}
              {editMode === "accessibilityFeature" && (
                <>
                  <div className="form-group">
                    <label htmlFor="feature_type">Feature Type</label>
                    {/* Use a select or input based on expected types */}
                    <input type="text" id="feature_type" name="feature_type" value={formData.feature_type || ""} onChange={handleInputChange} required placeholder="e.g., Ramp, Accessible Restroom, Elevator" />
                    {/* Example Select:
                    <select id="feature_type" name="feature_type" value={formData.feature_type || ""} onChange={handleInputChange} required>
                        <option value="">Select Type</option>
                        <option value="Ramp">Ramp</option>
                        <option value="Elevator">Elevator</option>
                        <option value="Accessible Restroom">Accessible Restroom</option>
                        <option value="Automatic Door">Automatic Door</option>
                         Add other common types
                    </select> */}
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description (Optional)</label>
                    <textarea id="description" name="description" value={formData.description || ""} onChange={handleInputChange} />
                  </div>
                  {/* Optional: Link to Building */}
                  <div className="form-group">
                    <label htmlFor="building_id">Building (Optional)</label>
                    <select id="building_id" name="building_id" value={formData.building_id || ""} onChange={handleInputChange}>
                      <option value="">None</option>
                      {buildings.map(b => <option key={b.building_id} value={b.building_id}>{b.name} (ID: {b.building_id})</option>)}
                    </select>
                  </div>
                  {/* Add other fields as needed (e.g., floor_level if linked to building) */}
                </>
              )}
              {/* ----------------------------------------- */}



              {/* Submit/Cancel Buttons */}
              <div className="form-actions">
                <button type="submit" className="save-btn">{selectedItem ? "Update" : "Save"} {editMode}</button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
              </div>
            </form>
          )}

          {/* Placeholder */}
          {editMode === "view" && !newItemPosition && !selectedItem && (
            <div className="form-placeholder">
              <p>Click map to add, or click item to edit.</p>
            </div>
          )}
        </div>
      </div>

      {/* DataViewer */}
      <DataViewer
        buildings={buildings}
        entrances={entrances}
        obstacles={obstacles}
        accessibilityFeatures={accessibilityFeatures} // Pass the new state
        onDeleteItem={handleDeleteItem}
      />
    </div>
  );
}

export default MapEditor;
