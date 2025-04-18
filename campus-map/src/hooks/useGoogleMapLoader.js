// src/hooks/useGoogleMapLoader.js
import { useState, useEffect, useRef } from 'react';

const GOOGLE_MAPS_LOAD_TIMEOUT = 5000; // 5 seconds

/**
 * Custom hook to manage the loading state and potential errors
 * of the Google Maps JavaScript API script.
 *
 * @param {string} apiKey - The Google Maps API Key.
 * @param {string[]} libraries - An array of Google Maps libraries to load (e.g., ['places']).
 * @returns {{ isLoaded: boolean, loadError: Error | null }} - An object containing the loading status and any error.
 */
const useGoogleMapLoader = (apiKey, libraries) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const timeoutIdRef = useRef(null); // Ref to store the timeout ID

  useEffect(() => {
    // Reset state on key or libraries change
    setIsLoaded(false);
    setLoadError(null);
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    // Basic API Key validation
    if (!apiKey || apiKey.length < 10) {
      console.error('Invalid Google Maps API Key provided.');
      setLoadError(new Error('Invalid Google Maps API Key provided.'));
      return; // Stop execution if key is invalid
    }

    // Check if Google Maps is already loaded (e.g., by another component/script)
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded.');
      setIsLoaded(true);
      return;
    }

    // --- Script Loading Logic ---
    // We won't directly inject the script here, as @react-google-maps/api's <LoadScript>
    // handles that. Instead, we'll monitor the loading process initiated by <LoadScript>.

    // Set a timeout to detect if the API fails to load within a reasonable time
    timeoutIdRef.current = setTimeout(() => {
      if (!window.google || !window.google.maps) {
        console.error(`Google Maps API failed to load within ${GOOGLE_MAPS_LOAD_TIMEOUT / 1000} seconds.`);
        setLoadError(new Error('Google Maps API loading timed out.'));
        // We don't set isLoaded to false here, as LoadScript might still succeed later,
        // but the error state indicates a problem.
      }
    }, GOOGLE_MAPS_LOAD_TIMEOUT);

    // Cleanup function to clear the timeout if the component unmounts
    // or if the effect re-runs before the timeout triggers.
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };

  }, [apiKey, libraries]); // Re-run effect if apiKey or libraries change

  // --- Callback functions for <LoadScript> ---
  // These will be passed to <LoadScript> to update our hook's state

  const handleLoadSuccess = () => {
    console.log('Google Maps API loaded successfully via LoadScript.');
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current); // Clear timeout on success
      timeoutIdRef.current = null;
    }
    setIsLoaded(true);
    setLoadError(null); // Clear any previous error (like timeout)
  };

  const handleLoadError = (error) => {
    console.error('Google Maps API failed to load via LoadScript:', error);
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current); // Clear timeout on error
      timeoutIdRef.current = null;
    }
    setLoadError(error instanceof Error ? error : new Error('Failed to load Google Maps script.'));
    setIsLoaded(false);
  };

  // Return the state and the handlers for LoadScript
  return { isLoaded, loadError, handleLoadSuccess, handleLoadError };
};

export default useGoogleMapLoader;
