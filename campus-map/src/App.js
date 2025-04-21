import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMapInterface from './pages/MainMapInterface';
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
  
  // Define the future flags
  const future = { v7_startTransition: true, v7_relativeSplatPath: true };

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
              <Route path="*" element={<MainMapInterface />} />
              <Route path="/admin" element={<MapEditor />} />
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
