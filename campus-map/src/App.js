import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMapInterface from './pages/MainMapInterface';
import HomePage from './pages/HomePage'; // Import HomePage
import ObstacleReports from './features/obstacles/components/ObstacleReports';
import './App.css';
import MapEditor from './features/admin/components/MapEditor';
import { SearchProvider } from './features/search/contexts/SearchContext';
import { MapProvider } from './features/map/contexts/MapContext';
import { RoutingProvider } from './features/routing/context/RoutingContext';
import { IndoorViewProvider } from './features/indoor/IndoorViewContext';
import { UserLocationProvider } from './features/location/UserLocationContext';
import { ObstacleProvider } from './features/obstacles/contexts/ObstacleContext';

// Create context for accessibility settings
export const AccessibilityContext = createContext();

// --- Define API Base URL (Best Practice: Use Environment Variables) ---
// Use REACT_APP_API_URL environment variable if set, otherwise default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001'; // Adjust default if your Flask app runs elsewhere


// --- Mock// --- Updated API Check Function ---
async function checkApiConnection() {
  // Use a simple GET endpoint from your API, like fetching buildings
  const healthCheckUrl = `${API_BASE_URL}/api/buildings`; // Make sure API_BASE_URL has http://  
  try {
    console.log(`Checking API connection at: ${healthCheckUrl}`);
    const response = await fetch(healthCheckUrl, {
        method: 'GET',
        headers: {
            // Add any necessary headers, though likely not needed for a simple GET
            'Content-Type': 'application/json',
            // If you add authentication later, you might need an Authorization header
        },
        // Optional: Add timeout to prevent hanging indefinitely
        // signal: AbortSignal.timeout(5000) // 5 seconds timeout (requires newer browser/Node features)
    });

    if (!response.ok) {
      // Log the status for debugging
      console.error(`API check failed with status: ${response.status} ${response.statusText}`);
      // You could potentially check specific statuses (e.g., 503 Service Unavailable)
      throw new Error(`API check failed with status: ${response.status}`);
    }

    // Optional: Check if the response body is valid JSON (if expected)
    // const data = await response.json();
    // if (!Array.isArray(data)) { // Assuming /api/buildings returns an array
    //   throw new Error('API check received unexpected data format.');
    // }

    console.log('API connection successful.');
    return true; // API is reachable and responding correctly

  } catch (error) {
    // This catches network errors (fetch failed) or errors thrown above
    console.error('API connection check failed:', error.message);
    return false; // API is not reachable or responded with an error
  }
}
// --- End Updated API Check Function ---



function App() {
  // State for API connection status: 'checking', 'connected', 'failed'
  const [apiStatus, setApiStatus] = useState('checking');

  // Initialize accessibility settings
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: localStorage.getItem('highContrast') === 'true' || false,
    largeText: localStorage.getItem('largeText') === 'true' || false,
    screenReader: localStorage.getItem('screenReader') === 'true' || false
  });

  // Effect for API check on initial load
  useEffect(() => {
    const verifyApi = async () => {
      const isConnected = await checkApiConnection();
      setApiStatus(isConnected ? 'connected' : 'failed');
    };

    verifyApi();
    // Run only once on mount
  }, []);


  // Apply accessibility classes to document root
  useEffect(() => {
    const rootElement = document.documentElement;
    // ... (keep existing accessibility logic) ...
    if (accessibilitySettings.highContrast) {
      rootElement.classList.add('high-contrast');
    } else {
      rootElement.classList.remove('high-contrast');
    }
    if (accessibilitySettings.largeText) {
      rootElement.classList.add('large-text');
    } else {
      rootElement.classList.remove('large-text');
    }
    if (accessibilitySettings.screenReader) {
      rootElement.classList.add('screen-reader-mode');
    } else {
      rootElement.classList.remove('screen-reader-mode');
    }
    localStorage.setItem('highContrast', accessibilitySettings.highContrast);
    localStorage.setItem('largeText', accessibilitySettings.largeText);
    localStorage.setItem('screenReader', accessibilitySettings.screenReader);
  }, [accessibilitySettings]);

  // Define the future flags
  const future = { v7_startTransition: true, v7_relativeSplatPath: true };

  // --- Conditional Rendering based on API Status ---

  // Display loading indicator while checking
  if (apiStatus === 'checking') {
    return <div className="loading-app">Checking connection...</div>; // Or a more sophisticated loading component
  }

  // Display HomePage if API check failed
  if (apiStatus === 'failed') {
    // Render only the HomePage if the core API is down
    // You might want to wrap this in a minimal context provider set if HomePage needs them
    return (
       <AccessibilityContext.Provider value={{ accessibilitySettings, setAccessibilitySettings }}>
         {/* Consider if HomePage needs any specific providers */}
         <Router future={future}>
            <div className={`app ${accessibilitySettings.largeText ? 'large-text' : ''}`}>
              <Routes>
                {/* Force all paths to HomePage on API failure */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </div>
         </Router>
       </AccessibilityContext.Provider>
    );
  }

  // --- Render Full App if API is connected ---
  return (
    <AccessibilityContext.Provider value={{ accessibilitySettings, setAccessibilitySettings }}>
      <MapProvider>
      <ObstacleProvider>
      <SearchProvider>
      <RoutingProvider>
      <IndoorViewProvider>
      <UserLocationProvider>
        <Router future={future}>
          <div className={`app ${accessibilitySettings.largeText ? 'large-text' : ''}`}>
            <Routes>
              <Route path="/" element={<MainMapInterface />} />
              <Route path="/report" element={<ObstacleReports />} />
              {/* Consider adding a specific route for HomePage if needed when API is up */}
              {/* <Route path="/home" element={<HomePage />} /> */}
              <Route path="/admin" element={<MapEditor />} />
              {/* Fallback to MainMapInterface if API is connected */}
              <Route path="*" element={<MainMapInterface />} />
            </Routes>
          </div>
        </Router>
      </UserLocationProvider>
      </IndoorViewProvider>
      </RoutingProvider>
      </SearchProvider>
      </ObstacleProvider>
      </MapProvider>
    </AccessibilityContext.Provider>
  );
}

export default App;
