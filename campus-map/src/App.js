import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import InteractiveMap from './components/InteractiveMap';
import ObstacleReports from './components/ObstacleReports';
import AboutPage from './components/AboutPage';
import TestMap from './components/TestMap';
import AppLayout from './components/AppLayout';
import './App.css';

// API Base URL - Make sure to update in .env file
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Debug component to check environment variables
const DebugInfo = () => {
  // For React, environment variables must be prefixed with REACT_APP_
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 9999,
      fontSize: '12px',
      maxWidth: '400px',
      overflow: 'auto'
    }}>
      <h4>Environment Debug:</h4>
      <p>API Key: {apiKey ? 
        `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 
        'Not found'}</p>
      <p>Key Length: {apiKey ? apiKey.length : 0}</p>
      <p>Environment: {process.env.NODE_ENV}</p>
      <p>API URL: {API_BASE_URL}</p>
      <p>Direct Key Check: {"AIzaSyACo9gj_wQRJBCq5iAmWcwyNmAq_x8daEg".substring(0, 4)}...</p>
    </div>
  );
};

// Create context for accessibility settings
export const AccessibilityContext = createContext();

// Create context for user routing preferences
export const UserPreferencesContext = createContext();

function App() {
  // Initialize accessibility settings (check localStorage for saved preferences)
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: localStorage.getItem('highContrast') === 'true' || false,
    largeText: localStorage.getItem('largeText') === 'true' || false,
    screenReader: localStorage.getItem('screenReader') === 'true' || false
  });
  
  // Initialize user routing preferences
  const [userPreferences, setUserPreferences] = useState(() => {
    const savedPrefs = localStorage.getItem('mobiNavUserPreferences');
    if (savedPrefs) {
      try {
        return JSON.parse(savedPrefs);
      } catch (error) {
        console.error('Failed to parse saved preferences:', error);
      }
    }
    
    // Default preferences if none are saved
    return {
      mobilityType: 'walking', // walking, wheelchair, cane, etc.
      avoidStairs: false,
      preferElevators: false,
      preferSmoothPavement: false,
      avoidHighTraffic: false,
      routeProvider: 'api', // api, google, osrm
      showBuildingInfo: true,
      showObstacles: true,
      showAccessibilityFeatures: true,
      travelTimeMultiplier: 1.0 // For different mobility types
    };
  });
  
  // Function to update user preferences
  const updateUserPreferences = (preference, value) => {
    setUserPreferences(prev => {
      const newPrefs = {
        ...prev,
        [preference]: value
      };
      
      // Save to localStorage
      localStorage.setItem('mobiNavUserPreferences', JSON.stringify(newPrefs));
      return newPrefs;
    });
  };

  // Apply accessibility classes to document root
  useEffect(() => {
    const rootElement = document.documentElement;
    
    // Apply high contrast class
    if (accessibilitySettings.highContrast) {
      rootElement.classList.add('high-contrast');
    } else {
      rootElement.classList.remove('high-contrast');
    }
    
    // Apply large text class
    if (accessibilitySettings.largeText) {
      rootElement.classList.add('large-text');
    } else {
      rootElement.classList.remove('large-text');
    }
    
    // Apply screen reader class
    if (accessibilitySettings.screenReader) {
      rootElement.classList.add('screen-reader-mode');
    } else {
      rootElement.classList.remove('screen-reader-mode');
    }
    
    // Save to localStorage
    localStorage.setItem('highContrast', accessibilitySettings.highContrast);
    localStorage.setItem('largeText', accessibilitySettings.largeText);
    localStorage.setItem('screenReader', accessibilitySettings.screenReader);
  }, [accessibilitySettings]);
  
  // Log debug information
  useEffect(() => {
    console.log('MobiNav App initialized - Environment:', process.env.NODE_ENV);
    console.log('API Base URL:', API_BASE_URL);
  }, []);
  
  return (
    <AccessibilityContext.Provider value={{ accessibilitySettings, setAccessibilitySettings }}>
      <UserPreferencesContext.Provider value={{ 
        userPreferences, 
        updateUserPreferences, 
        API_BASE_URL 
      }}>
        <Router>
          <div className={`app ${accessibilitySettings.highContrast ? 'high-contrast' : ''} ${accessibilitySettings.largeText ? 'large-text' : ''}`}>
            <Routes>
              <Route path="/*" element={
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/map" element={<InteractiveMap />} />
                    <Route path="/route" element={<InteractiveMap />} />
                    <Route path="/report" element={<ObstacleReports />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/test" element={<TestMap />} />
                    <Route path="*" element={<HomePage />} />
                  </Routes>
                </AppLayout>
              } />
            </Routes>
            {/* Add debug component in development mode */}
            {process.env.NODE_ENV !== 'production' && <DebugInfo />}
          </div>
        </Router>
      </UserPreferencesContext.Provider>
    </AccessibilityContext.Provider>
  );
}

export default App;
