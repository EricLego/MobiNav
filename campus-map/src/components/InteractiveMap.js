import React, { useState, useEffect, useRef, useContext } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Polyline, Polygon } from '@react-google-maps/api';
import { AccessibilityContext, UserPreferencesContext } from '../App';
import '../styles/InteractiveMap.css';
// Import Leaflet (already in package.json) for OSRM map rendering
import 'leaflet/dist/leaflet.css';

const InteractiveMap = () => {
  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [route, setRoute] = useState([]);
  const [googleRoute, setGoogleRoute] = useState([]);
  const [osrmRoute, setOsrmRoute] = useState([]);
  const [routeProvider, setRouteProvider] = useState('google'); // 'google', 'osrm', or 'dual'
  const [obstacles, setObstacles] = useState([]);
  const [backendObstacles, setBackendObstacles] = useState([]);
  const [accessibilityFeatures, setAccessibilityFeatures] = useState([]);
  const [wheelchairMode, setWheelchairMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [googleMapsError, setGoogleMapsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDualRoutes, setShowDualRoutes] = useState(false);
  
  // Marietta Campus Points of Interest for OSRM layer
  const [mariettaPoiData] = useState([
    { name: 'Wilder Communications Center', coordinates: [33.93455660617953, -84.52081934524365] },
    { name: 'Civil Engineering Soils Lab', coordinates: [33.93540362312106, -84.52036756689206] },
    { name: 'Civil & Environmental Engineering', coordinates: [33.93588763354318, -84.52046680862038] },
    { name: 'Hornet Village Building 200', coordinates: [33.936719315266686, -84.52166898423492] },
    { name: 'Hornet Village Building 100', coordinates: [33.93718839012865, -84.52204992079598] },
    { name: 'Stingers Dining Hall', coordinates: [33.93746419390562, -84.52200353217164] },
    { name: 'West Parking Deck', coordinates: [33.9375501438482, -84.52221082789227] },
    { name: 'Engineering Technology Center', coordinates: [33.93817339276375, -84.52224839237287] },
    { name: 'Engineering Technology Center 2', coordinates: [33.93863121376631, -84.52211492419309] },
    { name: 'Design Building', coordinates: [33.93787177874704, -84.52165835034563] },
    { name: 'Engineering Lab', coordinates: [33.93856210850054, -84.52092234083258] },
    { name: 'Engineering Lab 2', coordinates: [33.93855988324149, -84.52116172797776] },
    { name: 'Science Lab Annex', coordinates: [33.93871755639936, -84.5215036865333] },
    { name: 'Crawford Lab', coordinates: [33.93930912458764, -84.52146694626319] },
    { name: 'Crawford Lab 2', coordinates: [33.939468229063785, -84.52156283523169] },
    { name: 'Academic Building', coordinates: [33.93870600583617, -84.5207289032058] },
    { name: 'Academic Building 2', coordinates: [33.93849428566808, -84.52033690881781] },
    { name: 'Atrium', coordinates: [33.9382041092832, -84.52016672888843] },
    { name: 'Atrium 2', coordinates: [33.93763384126216, -84.52000779258384] },
    { name: 'Atrium 3', coordinates: [33.93764511141814, -84.52040037884046] },
    { name: 'Atrium 4', coordinates: [33.93707483964624, -84.52018710533852] },
    { name: 'Johnson Library', coordinates: [33.93902721611566, -84.52050930501083] },
    { name: 'Johnson Library 2', coordinates: [33.93944666172132, -84.52010719140327] },
    { name: 'Administration', coordinates: [33.939799774802935, -84.51981560023374] },
    { name: 'Administration 2', coordinates: [33.939637590138126, -84.51942025326288] },
    { name: 'Norton Hall', coordinates: [33.93913602090555, -84.51929083123834] },
    { name: 'Norton Hall 2', coordinates: [33.93889910161332, -84.51969849931776] },
    { name: 'Norton Hall 3', coordinates: [33.93890701971558, -84.51920506939514] },
    { name: 'Howell Hall', coordinates: [33.9379709229149, -84.51884195333234] },
    { name: 'Howell Hall 2', coordinates: [33.93816730316157, -84.51843626924024] },
    { name: 'Howell Hall 3', coordinates: [33.93826410232331, -84.5189505827917] },
    { name: 'Housing Office', coordinates: [33.93828624073086, -84.5179381956037] },
    { name: 'Resident Community Center', coordinates: [33.93825262277839, -84.51773948223924] },
    { name: 'Architecture', coordinates: [33.93625116321012, -84.51943484429044] },
    { name: 'W. Clair Harris Textile Center', coordinates: [33.936553978766426, -84.51984708967207] },
    { name: 'W. Clair Harris Textile Center 2', coordinates: [33.93713680672734, -84.5198657179308] },
    { name: 'Atrium Connector', coordinates: [33.93701015800386, -84.52021386579622] },
    { name: 'Atrium Connector 2', coordinates: [33.93765215453384, -84.52036809280771] },
    { name: 'Atrium Connector 3', coordinates: [33.937654379816635, -84.52002879338522] },
    { name: 'Atrium Connector 4', coordinates: [33.938222381353945, -84.52018972591551] },
    { name: 'Mathematics', coordinates: [33.93967114033872, -84.52099767231611] },
    { name: 'Mathematics 2', coordinates: [33.93997043325382, -84.52051219251037] },
    { name: 'Joe Mack Wilson Student Center', coordinates: [33.94032035064124, -84.52016703942846] },
    { name: 'Joe Mack Wilson Student Center 2', coordinates: [33.94077262400745, -84.52022873022872] },
    { name: 'Recreation & Wellness Center', coordinates: [33.94121750966809, -84.51783285841829] }
  ]);
  
  // Hardcode API key directly - confirmed working in TestMap
  const API_KEY = 'AIzaSyACo9gj_wQRJBCq5iAmWcwyNmAq_x8daEg';
  
  const mapContainerStyle = {
    width: '100%',
    height: '100%',
    minHeight: 'calc(100vh - 150px)',
  };
  
  const center = {
    lat: 33.9386, // KSU Marietta Campus (center point of the polygon)
    lng: -84.5187,
  };
  
  // KSU Marietta Campus boundary polygon
  const campusBoundary = [
    { lat: 33.940912, lng: -84.524504 }, // NW
    { lat: 33.941486, lng: -84.515582 }, // NE
    { lat: 33.935908, lng: -84.512786 }, // SE
    { lat: 33.935673, lng: -84.524473 }, // SW
    { lat: 33.940912, lng: -84.524504 }, // NW (close the polygon)
  ];

  // State to store campus locations with accessible entrance data
  const [campusLocations, setCampusLocations] = useState([
    { 
      id: 1, 
      name: 'Atrium Building', 
      lat: 33.9376, 
      lng: -84.5205, 
      type: 'building', 
      hasElevator: false,
      entrances: [
        {
          id: 101,
          name: 'Atrium Main Entrance',
          type: 'main',
          accessible: false,
          lat: 33.9376, 
          lng: -84.5205
        },
        {
          id: 102,
          name: 'Atrium West Accessible Entrance',
          type: 'accessible',
          accessible: true,
          lat: 33.9377, 
          lng: -84.5206,
          features: ['ramp', 'automatic_door']
        }
      ]
    },
    { 
      id: 2, 
      name: 'Stingers Dining Hall', 
      lat: 33.9375, 
      lng: -84.5220, 
      type: 'building', 
      hasElevator: false,
      entrances: [
        {
          id: 201,
          name: 'Stingers Main Entrance',
          type: 'main',
          accessible: false,
          lat: 33.9375, 
          lng: -84.5220
        },
        {
          id: 202,
          name: 'Stingers Side Accessible Entrance',
          type: 'accessible',
          accessible: true,
          lat: 33.9376, 
          lng: -84.5219,
          features: ['ramp']
        }
      ]
    },
    { 
      id: 3, 
      name: 'West Deck', 
      lat: 33.9376, 
      lng: -84.5222, 
      type: 'building', 
      hasElevator: true,
      entrances: [
        {
          id: 301,
          name: 'West Deck Main Entrance',
          type: 'main',
          accessible: true, // Elevator available
          lat: 33.9376, 
          lng: -84.5222,
          features: ['elevator']
        }
      ]
    },
    { 
      id: 4, 
      name: 'Library', 
      lat: 33.9394, 
      lng: -84.5203, 
      type: 'building', 
      hasElevator: true,
      entrances: [
        {
          id: 401,
          name: 'Library Front Entrance',
          type: 'main',
          accessible: false,
          lat: 33.9394, 
          lng: -84.5203
        },
        {
          id: 402,
          name: 'Library North Accessible Entrance',
          type: 'accessible',
          accessible: true,
          lat: 33.9395, 
          lng: -84.5202,
          features: ['ramp', 'automatic_door']
        }
      ]
    },
    { 
      id: 5, 
      name: 'Bus Stop', 
      lat: 33.9405, 
      lng: -84.5188, 
      type: 'transportation',
      accessible: true
    }
  ]);

  // State for the new location form
  const [newLocation, setNewLocation] = useState({
    name: '',
    lat: '',
    lng: '',
    type: 'building',
    hasElevator: true
  });
  
  // State for map click mode (pin mode)
  const [isPinMode, setIsPinMode] = useState(false);
  
  // State for temporary marker when in pin mode
  const [tempMarker, setTempMarker] = useState(null);
  
  // State for the location form modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // State for location management section
  const [locationManagementOpen, setLocationManagementOpen] = useState(false);
  
  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewLocation(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Function to add a new location
  const addNewLocation = (e) => {
    if (e) e.preventDefault();
    
    // Validate form
    if (!newLocation.name || !newLocation.lat || !newLocation.lng) {
      alert('Please fill out all required fields');
      return;
    }
    
    // Create new location object
    const location = {
      id: campusLocations.length > 0 ? Math.max(...campusLocations.map(l => l.id)) + 1 : 1,
      name: newLocation.name,
      lat: parseFloat(newLocation.lat),
      lng: parseFloat(newLocation.lng),
      type: newLocation.type,
      ...(newLocation.type === 'building' && { hasElevator: newLocation.hasElevator })
    };
    
    // Add to locations array
    setCampusLocations(prev => [...prev, location]);
    
    // Reset form
    setNewLocation({
      name: '',
      lat: '',
      lng: '',
      type: 'building',
      hasElevator: true
    });
    
    // Clear temporary marker
    setTempMarker(null);
    
    // Close modal if open
    setShowLocationModal(false);
    
    // Show confirmation message
    alert(`Location "${location.name}" added successfully!`);
    
    // If we were in pin mode, exit it
    if (isPinMode) {
      setIsPinMode(false);
    }
  };
  
  // Function to delete a location
  const deleteLocation = (id) => {
    // Confirm delete
    if (window.confirm('Are you sure you want to delete this location?')) {
      setCampusLocations(prev => prev.filter(location => location.id !== id));
      
      // If this location was set as start or end point, clear it
      if (startPoint && campusLocations.find(loc => loc.id === id && loc.name === startPoint)) {
        setStartPoint('');
      }
      
      if (endPoint && campusLocations.find(loc => loc.id === id && loc.name === endPoint)) {
        setEndPoint('');
      }
    }
  };
  
  // Function to load locations from a CSV file
  const loadLocationsFromCSV = (csvContent) => {
    // Split the CSV content by newlines
    const lines = csvContent.split('\n');
    
    // The first line should be the header
    const headers = lines[0].split(',');
    
    // Process remaining lines (skip the header)
    const newLocations = lines.slice(1).filter(line => line.trim() !== '').map((line, index) => {
      const values = line.split(',');
      const location = {};
      
      // Map values to properties based on headers
      headers.forEach((header, i) => {
        if (header === 'id') {
          location[header] = parseInt(values[i], 10);
        } else if (header === 'lat' || header === 'lng') {
          location[header] = parseFloat(values[i]);
        } else if (header === 'hasElevator') {
          location[header] = values[i].toLowerCase() === 'true';
        } else {
          location[header] = values[i];
        }
      });
      
      // Add ID if not provided in CSV
      if (!location.id) {
        location.id = index + 1;
      }
      
      return location;
    });
    
    setCampusLocations(newLocations);
  };

  // Function to handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        loadLocationsFromCSV(content);
      };
      reader.readAsText(file);
    }
  };

  // Function to export locations as CSV
  const exportLocationsAsCSV = () => {
    if (campusLocations.length === 0) return;
    
    // Get headers from the first location
    const headers = Object.keys(campusLocations[0]);
    
    // Create CSV content
    const csvContent = 
      headers.join(',') + '\n' + 
      campusLocations.map(loc => (
        headers.map(header => loc[header]).join(',')
      )).join('\n');
    
    // Create a downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'campus_locations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle escape key to exit pin mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showLocationModal) {
          // If modal is open, close it
          setShowLocationModal(false);
          setTempMarker(null);
        } else if (isPinMode) {
          // Otherwise, exit pin mode if active
          setIsPinMode(false);
          setTempMarker(null);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPinMode, showLocationModal]);
  
  // Get API base URL from context
  const { userPreferences, API_BASE_URL } = useContext(UserPreferencesContext);
  
  // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      // Fetch buildings and locations
      const fetchBuildings = async () => {
        try {
          const response = await fetch(`${API_BASE_URL || ''}/api/buildings`);
          const data = await response.json();
          
          if (data.buildings && data.buildings.length > 0) {
            // Transform backend data to match frontend data structure
            const buildings = data.buildings.map(building => {
              // Extract basic building info
              const buildingData = {
                id: building.id,
                name: building.name,
                lat: building.latitude,
                lng: building.longitude,
                type: building.building_type === 'parking' ? 'parking' : 
                      building.building_type === 'transportation' ? 'transportation' : 'building',
                hasElevator: building.has_elevator,
                floors: building.floors,
                description: building.description,
                entrances: []
              };
              
              // Add entrances if available
              if (building.entrances && building.entrances.length > 0) {
                buildingData.entrances = building.entrances.map(entrance => ({
                  id: entrance.id,
                  name: entrance.name,
                  type: entrance.entrance_type,
                  accessible: entrance.is_accessible,
                  lat: entrance.latitude,
                  lng: entrance.longitude,
                  features: entrance.features ? 
                    entrance.features.map(feature => feature.feature_type) : []
                }));
              }
              
              return buildingData;
            });
            
            setCampusLocations(buildings);
            console.log('Loaded buildings from API:', buildings.length);
          }
        } catch (error) {
          console.error("Failed to fetch buildings:", error);
          // Keep the existing mock data as fallback
          console.log('Using mock building data');
        }
      };
      
      // Fetch obstacles
      const fetchObstacles = async () => {
        try {
          const response = await fetch(`${API_BASE_URL || ''}/api/obstacles`);
          const data = await response.json();
          
          if (data.obstacles) {
            setBackendObstacles(data.obstacles);
            console.log('Loaded obstacles from API:', data.obstacles.length);
          }
        } catch (error) {
          console.error("Failed to fetch obstacles:", error);
          // If API fails, use mock data as fallback
          const mockObstacles = [
            { id: 1, location: 'Library Elevator', latitude: 33.9394, longitude: -84.5203, obstacle_type: 'elevator_outage', description: 'Out of Service', reported_at: '2025-03-15' },
            { id: 2, location: 'Path near Stingers', latitude: 33.9375, longitude: -84.5218, obstacle_type: 'construction', description: 'Under Construction', reported_at: '2025-03-16' },
          ];
          
          setBackendObstacles(mockObstacles);
        }
      };
      
      // Fetch accessibility features
      const fetchAccessibilityFeatures = async () => {
        try {
          const response = await fetch(`${API_BASE_URL || ''}/api/accessibility_features`);
          const data = await response.json();
          
          if (data.features) {
            setAccessibilityFeatures(data.features);
            console.log('Loaded accessibility features from API:', data.features.length);
          }
        } catch (error) {
          console.error("Failed to fetch accessibility features:", error);
          // If API fails, use mock data as fallback
          const mockAccessibilityFeatures = [
            { id: 1, feature_type: 'elevator', description: 'Elevator access to all levels', entrance: { latitude: 33.9376, longitude: -84.5222, building_name: 'West Deck' } },
            { id: 2, feature_type: 'ramp', description: 'Wheelchair accessible entrance ramp', entrance: { latitude: 33.9394, longitude: -84.5205, building_name: 'Library' } },
          ];
          
          setAccessibilityFeatures(mockAccessibilityFeatures);
        }
      };
      
      // Fetch traffic data
      const fetchTrafficData = async () => {
        if (userPreferences.avoidHighTraffic) {
          try {
            const response = await fetch(`${API_BASE_URL || ''}/api/traffic`);
            const data = await response.json();
            
            if (data.traffic_data) {
              console.log('Loaded traffic data from API:', data.traffic_data.length);
              // Store traffic data if needed for routing
            }
          } catch (error) {
            console.error("Failed to fetch traffic data:", error);
          }
        }
      };
      
      // Execute all fetch operations
      await Promise.all([
        fetchBuildings(),
        fetchObstacles(),
        fetchAccessibilityFeatures(),
        fetchTrafficData()
      ]);
    };
    
    fetchData();
  }, [API_BASE_URL, userPreferences.avoidHighTraffic]);

  // Check for Google Maps API errors
  useEffect(() => {
    console.log("Using API Key:", API_KEY.substring(0, 5) + "..." + API_KEY.substring(API_KEY.length - 5));
    
    // Simple check for API key validity
    if (!API_KEY || API_KEY.length < 20) {
      console.error("API key is missing or invalid");
      setGoogleMapsError(true);
    } else {
      // Reset error state when component mounts with valid key
      setGoogleMapsError(false);
    }
  }, [API_KEY]);
  
  // Add page title and description
  useEffect(() => {
    document.title = "Campus Map | MobiNav - KSU Accessible Navigation";
    
    // Add a meta description tag if it doesn't exist
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Interactive map of Kennesaw State University campus with accessible route planning, wheelchair-friendly paths, and obstacle reporting.";
  }, []);

  // Function to handle map load
  const onMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };
  
  // Function to handle map clicks when in pin mode
  const handleMapClick = (event) => {
    console.log("Map clicked in pin mode:", event);
    
    try {
      // Get coordinates directly from event
      const lat = typeof event.latLng.lat === 'function' ? event.latLng.lat() : event.latLng.lat;
      const lng = typeof event.latLng.lng === 'function' ? event.latLng.lng() : event.latLng.lng;
      
      console.log("Extracted coordinates:", lat, lng);
      
      // Set the temporary marker
      setTempMarker({ lat, lng });
      
      // Pre-fill the new location form with coordinates
      setNewLocation(prev => ({
        ...prev,
        lat,
        lng
      }));
      
      // Open the location form modal
      setShowLocationModal(true);
    } catch (error) {
      console.error("Error handling map click:", error);
      alert("Error placing pin. Please try again.");
    }
  };
  
  // Function to toggle pin mode
  const togglePinMode = () => {
    setIsPinMode(!isPinMode);
    // Clear temporary marker when exiting pin mode
    if (isPinMode) {
      setTempMarker(null);
    }
  };
  
  // Function to cancel adding a new pin
  const cancelAddPin = () => {
    setShowLocationModal(false);
    setTempMarker(null);
  };

  // Function to handle marker click
  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
  };

  // Function to handle location selection for route planning
  const handleStartPointSelect = (location) => {
    setStartPoint(location.name);
    setSelectedLocation(null);
  };

  const handleEndPointSelect = (location) => {
    setEndPoint(location.name);
    setSelectedLocation(null);
  };

  // Function to calculate route using backend API
  const calculateRoute = async () => {
    // Find selected locations
    let start = campusLocations.find(loc => loc.name === startPoint);
    let end = campusLocations.find(loc => loc.name === endPoint);
    
    // Check if start or end points are OSRM POIs
    if (!start) {
      const osrmStart = mariettaPoiData.find(poi => poi.name === startPoint);
      if (osrmStart) {
        start = {
          name: osrmStart.name,
          lat: osrmStart.coordinates[0],
          lng: osrmStart.coordinates[1],
          type: 'poi'
        };
      }
    }
    
    if (!end) {
      const osrmEnd = mariettaPoiData.find(poi => poi.name === endPoint);
      if (osrmEnd) {
        end = {
          name: osrmEnd.name,
          lat: osrmEnd.coordinates[0],
          lng: osrmEnd.coordinates[1],
          type: 'poi'
        };
      }
    }
    
    if (!start || !end) {
      alert('Please select valid start and end points');
      return;
    }
    
    // If in wheelchair mode, use accessible entrances for routing
    if (wheelchairMode || userPreferences.mobilityType === 'wheelchair') {
      // For start point - use accessible entrance if available
      if (start.type === 'building' && start.entrances) {
        const accessibleEntrance = start.entrances.find(e => e.accessible);
        if (accessibleEntrance) {
          console.log(`Using accessible entrance for ${start.name} as start point`);
          // Create a new point that includes both the building and entrance info
          start = {
            ...accessibleEntrance,
            name: `${start.name} (Accessible Entrance)`,
            originalBuilding: start.name
          };
        }
      }
      
      // For end point - use accessible entrance if available
      if (end.type === 'building' && end.entrances) {
        const accessibleEntrance = end.entrances.find(e => e.accessible);
        if (accessibleEntrance) {
          console.log(`Using accessible entrance for ${end.name} as end point`);
          // Create a new point that includes both the building and entrance info
          end = {
            ...accessibleEntrance,
            name: `${end.name} (Accessible Entrance)`,
            originalBuilding: end.name
          };
        }
      }
    }
    
    setIsLoading(true);
    
    try {
      if (routeProvider === 'dual' || showDualRoutes) {
        // In dual mode, fetch both Google and OSRM routes
        await Promise.all([
          fetchRoute(start, end, 'google'),
          fetchRoute(start, end, 'osrm')
        ]);
      } else {
        // Fetch single route from selected provider
        await fetchRoute(start, end, routeProvider);
      }
      
      // If we got a route, center the map on the starting point
      const currentRoute = routeProvider === 'osrm' ? osrmRoute : googleRoute;
      if (currentRoute.length > 0 && map) {
        map.panTo(currentRoute[0]);
        map.setZoom(17);
      }
    } catch (error) {
      console.error('Failed to fetch route:', error);
      alert('Failed to calculate route. Please try again.');
      
      // Fallback to mock route for demo
      const mockRoute = [
        { lat: start.lat, lng: start.lng },
        { lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 - 0.001 },
        { lat: end.lat, lng: end.lng }
      ];
      
      if (routeProvider === 'google' || routeProvider === 'dual') {
        setGoogleRoute(mockRoute);
      }
      if (routeProvider === 'osrm' || routeProvider === 'dual') {
        setOsrmRoute(mockRoute);
      }
      setRoute(mockRoute);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch route from specified provider
  const fetchRoute = async (start, end, provider) => {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        start: `${start.lat},${start.lng}`,
        end: `${end.lat},${end.lng}`,
        provider: provider,
        wheelchair: (wheelchairMode || userPreferences.mobilityType === 'wheelchair').toString(),
      });
      
      // Add additional routing preferences from user preferences
      if (userPreferences.avoidStairs) {
        params.append('avoid_stairs', 'true');
      }
      
      if (userPreferences.preferElevators) {
        params.append('prefer_elevators', 'true');
      }
      
      if (userPreferences.preferSmoothPavement) {
        params.append('prefer_smooth_pavement', 'true');
      }
      
      if (userPreferences.avoidHighTraffic) {
        params.append('avoid_traffic', 'true');
      }
      
      // Call the backend API with routing parameters
      const response = await fetch(`${API_BASE_URL || ''}/api/route?${params.toString()}`);
      const data = await response.json();
      
      if (data.error) {
        console.error(`${provider.toUpperCase()} Route API Error:`, data.error);
        throw new Error(data.error);
      }
      
      // Format the route data from the API
      if (Array.isArray(data.route)) {
        // Convert route points to Google Maps format
        const formattedRoute = data.route.map(point => {
          // Handle both formats: [lat, lng] array or {lat, lng} object
          if (Array.isArray(point)) {
            return { lat: point[0], lng: point[1] };
          } else if (point && typeof point === 'object' && 'lat' in point && 'lng' in point) {
            return point;
          }
          return null;
        }).filter(point => point !== null);
        
        // Display route information
        if (data.distance && data.duration) {
          console.log(`Route distance: ${(data.distance/1000).toFixed(2)} km`);
          console.log(`Estimated duration: ${Math.round(data.duration/60)} minutes`);
          
          // You could also display this information in the UI
        }
        
        // Update the appropriate route state based on provider
        if (provider === 'google') {
          setGoogleRoute(formattedRoute);
          if (!showDualRoutes) {
            setRoute(formattedRoute);
          }
        } else if (provider === 'osrm') {
          setOsrmRoute(formattedRoute);
          if (!showDualRoutes) {
            setRoute(formattedRoute);
          }
        } else {
          // 'api' provider or any other
          setRoute(formattedRoute);
        }
        
        return formattedRoute;
      } else {
        console.error(`Invalid ${provider} route data format:`, data.route);
        throw new Error(`Invalid ${provider} route data format`);
      }
    } catch (error) {
      console.error(`Failed to fetch ${provider} route:`, error);
      throw error;
    }
  };

  // Function to handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search logic would go here - filter locations, etc.
    console.log('Searching for:', searchQuery);
    
    const searchResults = campusLocations.filter(
      location => location.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (searchResults.length > 0) {
      // Center the map on the first result
      if (map) {
        map.panTo({ lat: searchResults[0].lat, lng: searchResults[0].lng });
        map.setZoom(18);
      }
    }
  };

  // Function to toggle wheelchair mode
  const toggleWheelchairMode = () => {
    setWheelchairMode(!wheelchairMode);
    // If we already have a route, recalculate it with the new setting
    if (route.length > 0) {
      calculateRoute();
    }
  };

  const { accessibilitySettings } = useContext(AccessibilityContext);
  
  return (
    <div className="map-page-container">
      {/* Location Form Modal */}
      {showLocationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Location</h3>
            <p className="modal-coordinates">
              Coordinates: {tempMarker ? `${tempMarker.lat.toFixed(6)}, ${tempMarker.lng.toFixed(6)}` : ''}
            </p>
            
            <form onSubmit={addNewLocation}>
              <div className="form-group">
                <label htmlFor="modal-name">Location Name*</label>
                <input
                  type="text"
                  id="modal-name"
                  name="name"
                  value={newLocation.name}
                  onChange={handleInputChange}
                  placeholder="Enter location name"
                  required
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="modal-type">Type*</label>
                <select
                  id="modal-type"
                  name="type"
                  value={newLocation.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="building">Building</option>
                  <option value="parking">Parking</option>
                  <option value="transportation">Transportation</option>
                </select>
              </div>
              
              {newLocation.type === 'building' && (
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="hasElevator"
                      checked={newLocation.hasElevator}
                      onChange={handleInputChange}
                    />
                    Has Elevator Access
                  </label>
                </div>
              )}
              
              <div className="modal-actions">
                <button type="button" onClick={cancelAddPin} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="add-button">
                  Add Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="interactive-map">
        {/* SIDEBAR */}
        <div className="map-controls">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for campus locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">Search</button>
          </form>
          
          <div className="route-planner">
            <h3>Plan Your Route</h3>
            <div className="route-inputs">
              <select 
                value={startPoint} 
                onChange={(e) => setStartPoint(e.target.value)}
                className="route-select"
              >
                <option value="">Starting Point</option>
                <optgroup label="Campus Locations">
                  {campusLocations.map(location => (
                    <option key={`loc-${location.id}`} value={location.name}>{location.name}</option>
                  ))}
                </optgroup>
                {(routeProvider === 'osrm' || routeProvider === 'dual') && (
                  <optgroup label="OSRM Points of Interest">
                    {mariettaPoiData.map((poi, index) => (
                      <option key={`poi-start-${index}`} value={poi.name}>{poi.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
              
              <select 
                value={endPoint} 
                onChange={(e) => setEndPoint(e.target.value)}
                className="route-select"
              >
                <option value="">Destination</option>
                <optgroup label="Campus Locations">
                  {campusLocations.map(location => (
                    <option key={`loc-${location.id}`} value={location.name}>{location.name}</option>
                  ))}
                </optgroup>
                {(routeProvider === 'osrm' || routeProvider === 'dual') && (
                  <optgroup label="OSRM Points of Interest">
                    {mariettaPoiData.map((poi, index) => (
                      <option key={`poi-end-${index}`} value={poi.name}>{poi.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            
            <div className="route-options">
              <label className="wheelchair-toggle">
                <input 
                  type="checkbox" 
                  checked={wheelchairMode}
                  onChange={toggleWheelchairMode}
                />
                Wheelchair-Accessible Only
              </label>
            </div>
            
            <div className="route-provider-options">
              <h4>Routing Provider</h4>
              <div className="provider-option">
                <label className="radio-toggle">
                  <input 
                    type="radio" 
                    name="routeProvider"
                    checked={routeProvider === 'google'}
                    onChange={() => setRouteProvider('google')}
                  />
                  Google Maps (Building-to-Building)
                </label>
              </div>
              
              <div className="provider-option">
                <label className="radio-toggle">
                  <input 
                    type="radio" 
                    name="routeProvider"
                    checked={routeProvider === 'osrm'}
                    onChange={() => setRouteProvider('osrm')}
                  />
                  OSRM (Accessible Paths)
                </label>
              </div>
              
              <div className="provider-option">
                <label className="radio-toggle">
                  <input 
                    type="radio" 
                    name="routeProvider"
                    checked={routeProvider === 'dual'}
                    onChange={() => setRouteProvider('dual')}
                  />
                  Dual Layer (Compare Both)
                </label>
              </div>
            </div>
            
            <button 
              onClick={calculateRoute} 
              className="calculate-button"
              disabled={isLoading}
            >
              {isLoading ? 'Calculating...' : 'Calculate Route'}
            </button>
          </div>
        
          <div className="location-management">
            <h3 onClick={() => setLocationManagementOpen(!locationManagementOpen)} 
                className="collapsible-header">
              Manage Locations
              <span className={`toggle-icon ${locationManagementOpen ? 'open' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </h3>
            
            {locationManagementOpen && (
              <>
                <div className="location-controls">
                  <button 
                    onClick={togglePinMode} 
                    className={`pin-mode-button ${isPinMode ? 'active' : ''}`}
                    title={isPinMode ? 'Exit Pin Mode' : 'Enter Pin Mode (Click on map to add locations)'}
                  >
                    {isPinMode ? 'Exit Pin Mode' : 'Pin Mode'}
                  </button>
                  
                  <div className="file-input-container">
                    <input
                      type="file"
                      id="csv-upload"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="file-input"
                    />
                    <label htmlFor="csv-upload" className="file-input-label">
                      Import Locations (CSV)
                    </label>
                  </div>
                  <button 
                    onClick={exportLocationsAsCSV} 
                    className="export-button"
                  >
                    Export Locations (CSV)
                  </button>
                </div>
                
                {isPinMode && (
                  <div className="pin-mode-instructions">
                    <p>
                      <strong>Pin Mode Active:</strong> Click anywhere on the map to place a new location marker.
                      Press ESC or click "Exit Pin Mode" to cancel.
                    </p>
                  </div>
                )}
                <p className="location-help">
                  CSV format: id,name,lat,lng,type,hasElevator<br/>
                  <a href="/sample_locations.csv" download className="sample-link">Download Sample CSV</a>
                </p>
                
                <div className="add-location-form">
                  <h4>Add New Location</h4>
                  <form onSubmit={addNewLocation}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="location-name">Name*</label>
                        <input
                          type="text"
                          id="location-name"
                          name="name"
                          value={newLocation.name}
                          onChange={handleInputChange}
                          placeholder="Building Name"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="location-lat">Latitude*</label>
                        <input
                          type="number"
                          id="location-lat"
                          name="lat"
                          value={newLocation.lat}
                          onChange={handleInputChange}
                          step="0.0001"
                          placeholder="e.g. 33.9420"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="location-lng">Longitude*</label>
                        <input
                          type="number"
                          id="location-lng"
                          name="lng"
                          value={newLocation.lng}
                          onChange={handleInputChange}
                          step="0.0001"
                          placeholder="e.g. -84.5210"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="location-type">Type*</label>
                        <select
                          id="location-type"
                          name="type"
                          value={newLocation.type}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="building">Building</option>
                          <option value="parking">Parking</option>
                          <option value="transportation">Transportation</option>
                        </select>
                      </div>
                      
                      {newLocation.type === 'building' && (
                        <div className="form-group checkbox-group">
                          <label>
                            <input
                              type="checkbox"
                              name="hasElevator"
                              checked={newLocation.hasElevator}
                              onChange={handleInputChange}
                            />
                            Has Elevator
                          </label>
                        </div>
                      )}
                    </div>
                    
                    <button type="submit" className="add-location-button">Add Location</button>
                  </form>
                </div>
                
                {/* Location Table */}
                {campusLocations.length > 0 && (
                  <div className="location-table-container">
                    <h4>Current Locations ({campusLocations.length})</h4>
                    <div className="location-table-wrapper">
                      <table className="location-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Coordinates</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {campusLocations.map(location => (
                            <tr key={location.id}>
                              <td>{location.name}</td>
                              <td>
                                {location.type === 'building' ? 'Building' : 
                                 location.type === 'parking' ? 'Parking' : 'Transport'}
                                {location.type === 'building' && (
                                  <span className="elevator-badge">
                                    {location.hasElevator ? '♿' : ''}
                                  </span>
                                )}
                              </td>
                              <td>
                                <span className="coordinates">
                                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                                </span>
                              </td>
                              <td>
                                <button 
                                  onClick={() => deleteLocation(location.id)}
                                  className="delete-button"
                                  title="Delete location"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* MAP CONTAINER */}
        <div className={`map-container ${isPinMode ? 'pin-mode-active' : ''}`}>
          {googleMapsError ? (
            <div className="map-placeholder">
              <div className="map-placeholder-content">
                <h3>Interactive Campus Map</h3>
                <p>There was an error loading the Google Maps API. Please check your API key and try again.</p>
                <div className="mock-map">
                  <div className="mock-location" style={{top: '30%', left: '40%'}}>Engineering Building</div>
                  <div className="mock-location" style={{top: '50%', left: '60%'}}>Student Center</div>
                  <div className="mock-location" style={{top: '40%', left: '70%'}}>Library</div>
                  <div className="mock-location" style={{top: '20%', left: '45%'}}>Parking Deck A</div>
                  <div className="mock-location" style={{top: '60%', left: '55%'}}>Bus Stop</div>
                </div>
              </div>
            </div>
          ) : (
            <LoadScript 
              googleMapsApiKey={API_KEY}
              id="google-maps-script"
              loadingElement={<div>Loading Maps...</div>}
              onLoad={() => console.log('Google Maps API loaded successfully')}
              onError={() => {
                console.error('Google Maps failed to load in InteractiveMap');
                setGoogleMapsError(true);
              }}
            >
              {/* Add Legend for Routes and POIs */}
              {(routeProvider === 'dual' || routeProvider === 'osrm') && (
                <div className="route-legend" style={{
                  position: 'absolute', 
                  top: '10px', 
                  right: '10px', 
                  zIndex: 100,
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '4px'
                }}>
                  {/* Show route legend for dual routes */}
                  {routeProvider === 'dual' && (googleRoute.length > 0 || osrmRoute.length > 0) && (
                    <>
                      <div className="legend-item">
                        <div className="legend-color google-color"></div>
                        <span>Google (Building-to-Building)</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color osrm-color"></div>
                        <span>OSRM (Accessible Paths)</span>
                      </div>
                    </>
                  )}
                  
                  {/* Show OSRM POI legend when OSRM layer is active */}
                  {(routeProvider === 'osrm' || routeProvider === 'dual') && (
                    <div className="legend-item">
                      <div className="legend-icon" style={{
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        background: '#4CAF50',
                        borderRadius: '50%',
                        border: '1px solid white',
                        marginRight: '5px'
                      }}></div>
                      <span>OSRM Points of Interest ({mariettaPoiData.length})</span>
                    </div>
                  )}
                </div>
              )}
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={16}
                onLoad={onMapLoad}
                onClick={(e) => {
                  console.log("Map was clicked", e);
                  if (isPinMode) handleMapClick(e);
                }}
                options={{
                  streetViewControl: false,
                  fullscreenControl: true,
                  mapTypeControl: true,
                  zoomControl: true,
                  mapTypeControlOptions: {
                    position: 1, // TOP_RIGHT
                    style: 2 // DROPDOWN_MENU
                  },
                  zoomControlOptions: {
                    position: 3 // RIGHT_CENTER
                  },
                  fullscreenControlOptions: {
                    position: 3 // RIGHT_TOP
                  },
                  // Add back the restriction to confine users to campus
                  restriction: {
                    latLngBounds: {
                      north: 33.943,
                      south: 33.934,
                      east: -84.511,
                      west: -84.526
                    },
                    strictBounds: true
                  },
                  // Add back custom map styling
                  styles: [
                    {
                      featureType: "poi",
                      elementType: "labels",
                      stylers: [{ visibility: "off" }]
                    },
                    {
                      featureType: "road",
                      elementType: "geometry",
                      stylers: [{ color: "#ffffff" }]
                    },
                    {
                      featureType: "landscape",
                      elementType: "geometry",
                      stylers: [{ color: "#f5f5f5" }]
                    },
                    {
                      featureType: "water",
                      elementType: "geometry",
                      stylers: [{ color: "#c9eaf2" }]
                    },
                    {
                      featureType: "transit.station",
                      elementType: "labels.icon",
                      stylers: [{ visibility: "on" }]
                    }
                  ]
                }}
              >
                {/* Location Markers */}
                {campusLocations.map(location => (
                  <Marker
                    key={location.id}
                    position={{ lat: location.lat, lng: location.lng }}
                    onClick={() => handleMarkerClick(location)}
                    // Use simple label-based markers instead of custom icons
                    label={{
                      text: location.type === 'building' ? 'B' : 
                            location.type === 'parking' ? 'P' : 'T',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                ))}
                
                {/* Accessible Entrance Markers - only shown when wheelchair mode is on */}
                {wheelchairMode && campusLocations
                  .filter(location => location.entrances)
                  .flatMap(location => 
                    location.entrances
                      .filter(entrance => entrance.accessible)
                      .map(entrance => (
                        <Marker
                          key={`entrance-${entrance.id}`}
                          position={{ lat: entrance.lat, lng: entrance.lng }}
                          onClick={() => handleMarkerClick({
                            ...entrance,
                            parentLocation: location.name,
                            isAccessibleEntrance: true
                          })}
                          // Special icon for accessible entrances
                          icon={{
                            path: "M10,1.375c-3.17,0-5.75,2.548-5.75,5.682c0,6.685,5.259,11.276,5.483,11.469c0.152,0.132,0.382,0.132,0.534,0c0.224-0.193,5.481-4.784,5.481-11.469C15.75,3.923,13.171,1.375,10,1.375 M10,17.653c-1.064-1.024-4.929-5.127-4.929-10.596c0-2.68,2.212-4.861,4.929-4.861s4.929,2.181,4.929,4.861C14.927,12.518,11.063,16.627,10,17.653 M10,3.839c-1.815,0-3.286,1.47-3.286,3.286s1.47,3.286,3.286,3.286s3.286-1.47,3.286-3.286S11.815,3.839,10,3.839 M10,9.589c-1.359,0-2.464-1.105-2.464-2.464S8.641,4.661,10,4.661s2.464,1.105,2.464,2.464S11.359,9.589,10,9.589",
                            fillColor: "#4CAF50",
                            fillOpacity: 1,
                            strokeWeight: 1,
                            strokeColor: "#ffffff",
                            scale: 1.5,
                            anchor: { x: 10, y: 18 }
                          }}
                        />
                      ))
                  )
                }
                
                {/* Accessibility Features */}
                {accessibilityFeatures.map(feature => (
                  <Marker
                    key={`feature-${feature.id}`}
                    position={{ lat: feature.latitude, lng: feature.longitude }}
                    onClick={() => handleMarkerClick({
                      ...feature,
                      lat: feature.latitude,
                      lng: feature.longitude,
                      name: `${feature.feature_type}: ${feature.description}`
                    })}
                    // Accessibility feature markers with different shapes
                    label={feature.feature_type === 'elevator' ? 'E' : 
                           feature.feature_type === 'ramp' ? 'R' : 'A'}
                  />
                ))}
                
                {/* Obstacles from backend API */}
                {backendObstacles.map(obstacle => (
                  <Marker
                    key={`obstacle-${obstacle.id}`}
                    position={{ lat: obstacle.latitude, lng: obstacle.longitude }}
                    onClick={() => handleMarkerClick({
                      ...obstacle,
                      lat: obstacle.latitude,
                      lng: obstacle.longitude,
                      name: obstacle.description || `${obstacle.obstacle_type} obstacle`,
                      status: obstacle.obstacle_type === 'construction' ? 'Construction Area' : 
                             obstacle.obstacle_type === 'stairs' ? 'Stairs - No Ramp Available' :
                             obstacle.obstacle_type === 'steep' ? 'Steep Incline - Difficult Access' :
                             'Obstacle',
                      reportedAt: obstacle.reported_at
                    })}
                    // Obstacle markers with warning symbols
                    label="!"
                  />
                ))}
              
                {/* Info Window for Selected Location */}
                {selectedLocation && (
                  <InfoWindow
                    position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                    onCloseClick={() => setSelectedLocation(null)}
                  >
                    <div className="info-window">
                      <h3>
                        {selectedLocation.isAccessibleEntrance 
                          ? `${selectedLocation.name} (${selectedLocation.parentLocation})` 
                          : (selectedLocation.name || selectedLocation.location)
                        }
                      </h3>
                      
                      {/* Accessible entrance specific info */}
                      {selectedLocation.isAccessibleEntrance && (
                        <div className="accessibility-features">
                          <p className="feature-title">Accessible Entrance</p>
                          {selectedLocation.features && selectedLocation.features.length > 0 && (
                            <ul className="feature-list">
                              {selectedLocation.features.map((feature, index) => (
                                <li key={index}>
                                  {feature === 'ramp' && '♿ Ramp Access'}
                                  {feature === 'automatic_door' && '🚪 Automatic Door'}
                                  {feature === 'elevator' && '⬆️ Elevator Access'}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      
                      {/* Building info */}
                      {selectedLocation.type === 'building' && !selectedLocation.isAccessibleEntrance && (
                        <p>Elevator Available: {selectedLocation.hasElevator ? 'Yes' : 'No'}</p>
                      )}
                      
                      {/* Obstacle info */}
                      {selectedLocation.status && (
                        <div className="obstacle-info">
                          <p className="status">{selectedLocation.status}</p>
                          <p className="reported">Reported: {selectedLocation.reportedAt}</p>
                        </div>
                      )}
                      
                      {/* OSRM POI info */}
                      {selectedLocation.isOsrmPoi && (
                        <div className="poi-info">
                          <p>OSRM Point of Interest</p>
                          <p className="coordinates">Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
                        </div>
                      )}
                      
                      <div className="info-actions">
                        <button onClick={() => handleStartPointSelect(
                          // If in wheelchair mode and this is a building with accessible entrances,
                          // use the accessible entrance as the start point
                          wheelchairMode && !selectedLocation.isAccessibleEntrance && 
                          selectedLocation.entrances && 
                          selectedLocation.entrances.some(e => e.accessible)
                            ? {
                                ...selectedLocation.entrances.find(e => e.accessible),
                                name: selectedLocation.name + " (Accessible Entrance)"
                              }
                            : selectedLocation
                        )}>
                          Set as Start
                        </button>
                        <button onClick={() => handleEndPointSelect(
                          // If in wheelchair mode and this is a building with accessible entrances,
                          // use the accessible entrance as the destination
                          wheelchairMode && !selectedLocation.isAccessibleEntrance && 
                          selectedLocation.entrances && 
                          selectedLocation.entrances.some(e => e.accessible)
                            ? {
                                ...selectedLocation.entrances.find(e => e.accessible),
                                name: selectedLocation.name + " (Accessible Entrance)"
                              }
                            : selectedLocation
                        )}>
                          Set as Destination
                        </button>
                      </div>
                    </div>
                  </InfoWindow>
                )}
                
                {/* Route Polylines */}
                {/* OSRM Points of Interest - only show when OSRM layer is active */}
                {(routeProvider === 'osrm' || routeProvider === 'dual') && (
                  mariettaPoiData.map((poi, index) => (
                    <Marker
                      key={`poi-${index}`}
                      position={{ lat: poi.coordinates[0], lng: poi.coordinates[1] }}
                      onClick={() => handleMarkerClick({
                        name: poi.name,
                        lat: poi.coordinates[0],
                        lng: poi.coordinates[1],
                        type: 'poi',
                        isOsrmPoi: true
                      })}
                      icon={{
                        path: "M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z",
                        fillColor: "#4CAF50", // Green to match OSRM route color
                        fillOpacity: 1,
                        strokeWeight: 1,
                        strokeColor: "#ffffff",
                        scale: 1.2,
                        anchor: { x: 12, y: 22 }
                      }}
                    />
                  ))
                )}
                
                {/* When in dual mode, show both routes */}
                {routeProvider === 'dual' && (
                  <>
                    {/* Google Route in Blue */}
                    {googleRoute.length > 0 && (
                      <Polyline
                        path={googleRoute}
                        options={{
                          strokeColor: '#2196F3', // Blue for Google
                          strokeOpacity: 0.8,
                          strokeWeight: 5
                        }}
                      />
                    )}
                    
                    {/* OSRM Route in Green */}
                    {osrmRoute.length > 0 && (
                      <Polyline
                        path={osrmRoute}
                        options={{
                          strokeColor: '#4CAF50', // Green for OSRM
                          strokeOpacity: 0.8,
                          strokeWeight: 5
                        }}
                      />
                    )}
                    
                    {/* Add start/end markers */}
                    {(googleRoute.length > 0 || osrmRoute.length > 0) && (
                      <>
                        <Marker
                          position={googleRoute.length > 0 ? googleRoute[0] : osrmRoute[0]}
                          label={{
                            text: "S",
                            color: "white",
                            fontWeight: "bold"
                          }}
                        />
                        <Marker
                          position={
                            googleRoute.length > 0 
                              ? googleRoute[googleRoute.length - 1] 
                              : osrmRoute[osrmRoute.length - 1]
                          }
                          label={{
                            text: "D",
                            color: "white",
                            fontWeight: "bold"
                          }}
                        />
                      </>
                    )}
                  </>
                )}
                
                {/* Single route mode */}
                {routeProvider !== 'dual' && route.length > 0 && (
                  <>
                    <Polyline
                      path={route}
                      options={{
                        strokeColor: routeProvider === 'osrm' 
                          ? '#4CAF50'  // Green for OSRM
                          : '#2196F3', // Blue for Google
                        strokeOpacity: 0.8,
                        strokeWeight: 5
                      }}
                    />
                    {/* Add markers at start and end of route */}
                    <Marker
                      position={route[0]}
                      label={{
                        text: "S",
                        color: "white",
                        fontWeight: "bold"
                      }}
                    />
                    <Marker
                      position={route[route.length - 1]}
                      label={{
                        text: "D",
                        color: "white",
                        fontWeight: "bold"
                      }}
                    />
                  </>
                )}
                
                {/* Show temporary marker when in pin mode */}
                {tempMarker && (
                  <Marker
                    position={{ lat: tempMarker.lat, lng: tempMarker.lng }}
                    animation={2} // BOUNCE animation
                    label={{
                      text: "New",
                      color: "white",
                      fontWeight: "bold"
                    }}
                  />
                )}
                
                {/* Campus Boundary Polygon */}
                <Polygon
                  paths={campusBoundary}
                  options={{
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.1
                  }}
                />
              </GoogleMap>
            </LoadScript>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;