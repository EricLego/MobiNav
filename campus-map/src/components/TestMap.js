import React from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

const TestMap = () => {
  // Hardcoded API key for direct testing
  const API_KEY = 'AIzaSyACo9gj_wQRJBCq5iAmWcwyNmAq_x8daEg';
  
  const mapContainerStyle = {
    width: '100%',
    height: '500px'
  };
  
  const center = {
    lat: 33.9386,
    lng: -84.5187
  };

  return (
    <div>
      <h1>Simple Google Map Test</h1>
      <LoadScript googleMapsApiKey={API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={14}
        >
          {/* No markers or other components for simplicity */}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default TestMap;