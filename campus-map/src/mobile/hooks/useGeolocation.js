// src/mobile/hooks/useGeolocation.js
import { useState, useEffect } from 'react';

const defaultOptions = {
  enableHighAccuracy: true,
  timeout: 5000, // 5 seconds
  maximumAge: 0, // Don't use cached position
};

const useGeolocation = (options = defaultOptions) => {
  const [coords, setCoords] = useState(null); // { latitude, longitude, accuracy, ... }
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(new Error('Geolocation is not supported by your browser.'));
      setIsSupported(false);
      setIsLocating(false);
    }
  }, []); // Check support once on mount

  const getLocation = () => {
    if (!isSupported) return; // Don't try if not supported

    setIsLocating(true);
    setLocationError(null);
    setCoords(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
        });
        setLocationError(null);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError(error);
        setCoords(null);
        setIsLocating(false);
      },
      options
    );
  };

  // Optionally add watchPosition logic if needed later

  return { coords, isLocating, locationError, isSupported, getLocation };
};

export default useGeolocation;
