// src/hooks/useGoogleMapLoader.js
import { useState, useEffect, useRef, useCallback } from 'react';

const GOOGLE_MAPS_LOAD_TIMEOUT = 5000; // 5 seconds

/**
 * Custom hook to manage the loading state and potential errors
 * of the Google Maps JavaScript API script using @react-google-maps/api's LoadScript.
 *
 * @param {string} apiKey - The Google Maps API Key.
 * @param {string[]} libraries - An array of Google Maps libraries to load (e.g., ['places']).
 * @returns {{
 *   isLoaded: boolean,
 *   loadError: Error | null,
 *   handleLoadSuccess: () => void,
 *   handleLoadError: (error: Error) => void
 * }} - An object containing the loading status, error, and handlers for LoadScript.
 */
const useGoogleMapLoader = (apiKey, libraries) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const timeoutIdRef = useRef(null); // Ref to store the timeout ID

  // Memoize libraries array to prevent unnecessary effect runs if the parent re-renders
  const memoizedLibraries = JSON.stringify(libraries);

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
    // Note: LoadScript might handle this internally, but this is a safety check.
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded.');
      setIsLoaded(true);
      return;
    }

    // Set a timeout to detect if the API fails to load within a reasonable time
    // This acts as a fallback if LoadScript's onError doesn't fire for some reason.
    timeoutIdRef.current = setTimeout(() => {
      // Check again after the timeout
      if (!window.google || !window.google.maps) {
        console.error(`Google Maps API failed to load within ${GOOGLE_MAPS_LOAD_TIMEOUT / 1000} seconds.`);
        // Only set error if not already loaded and no specific error occurred
        if (!isLoaded && !loadError) {
           setLoadError(new Error('Google Maps API loading timed out.'));
        }
      }
    }, GOOGLE_MAPS_LOAD_TIMEOUT);

    // Cleanup function
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
    // Use memoizedLibraries string for dependency check
  }, [apiKey, memoizedLibraries, isLoaded, loadError]);

  // --- Callback functions for <LoadScript> ---
  const handleLoadSuccess = useCallback(() => {
    console.log('Google Maps API loaded successfully via LoadScript.');
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    setIsLoaded(true);
    setLoadError(null);
  }, []);

  const handleLoadError = useCallback((error) => {
    console.error('Google Maps API failed to load via LoadScript:', error);
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    setLoadError(error instanceof Error ? error : new Error('Failed to load Google Maps script.'));
    setIsLoaded(false);
  }, []);

  return { isLoaded, loadError, handleLoadSuccess, handleLoadError };
};

export default useGoogleMapLoader;
