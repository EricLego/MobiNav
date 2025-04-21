import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ObstacleReports from './features/data/components/ObstacleReports';
import './App.css';
import MapEditor from './features/admin/components/MapEditor';
import { SearchProvider } from './features/search/SearchContext';
import { MapProvider } from './features/map/MapContext';
import { RoutingProvider } from './features/routing/context/RoutingContext';
import { IndoorViewProvider } from './features/indoor/IndoorViewContext';
import { UserLocationProvider } from './features/location/UserLocationContext';

// Create context for accessibility settings
export const AccessibilityContext = createContext();

function App() {
  // Initialize accessibility settings (check localStorage for saved preferences)
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: localStorage.getItem('highContrast') === 'true' || false,
    largeText: localStorage.getItem('largeText') === 'true' || false,
    screenReader: localStorage.getItem('screenReader') === 'true' || false
  });

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
  
  return (
    <AccessibilityContext.Provider value={{ accessibilitySettings, setAccessibilitySettings }}>
      <MapProvider>
      <SearchProvider>
      <RoutingProvider>
      <IndoorViewProvider>
      <UserLocationProvider>
        <Router>
          <div className={`app ${accessibilitySettings.largeText ? 'large-text' : ''}`}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/report" element={<ObstacleReports />} />
              <Route path="*" element={<HomePage />} />
              <Route path="/admin" element={<MapEditor />} />
            </Routes>
          </div>
        </Router>
      </UserLocationProvider>
      </IndoorViewProvider>
      </RoutingProvider>
      </SearchProvider>
      </MapProvider>
    </AccessibilityContext.Provider>
  );
}

export default App;
