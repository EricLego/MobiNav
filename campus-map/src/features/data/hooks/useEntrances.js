// src/features/entrances/hooks/useEntrances.js
import { useState, useEffect, useCallback } from 'react';
import { fetchEntrances } from '../../../services/mapService'; // Adjust the path as necessary

/**
 * Custom hook to fetch and manage entrance data.
 *
 * @returns {object} An object containing:
 *  - entrances {Array<object>|null}: The array of entrance objects, or null if not loaded/error.
 *  - isLoading {boolean}: True if entrances are currently being fetched.
 *  - error {Error|null}: An error object if fetching failed, otherwise null.
 *  - refetchEntrances {function}: A function to manually trigger a refetch of the entrances.
 */
const useEntrances = () => {
  const [entrances, setEntrances] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadEntrances = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching entrances...");
      const data = await fetchEntrances();
      console.log("Entrances fetched successfully:", data);
      setEntrances(data || []); // Ensure it's an array, even if API returns null/undefined
    } catch (err) {
      console.error("Failed to fetch entrances:", err);
      setError(err);
      setEntrances(null); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies, fetchEntrances is stable

  // Fetch entrances on initial mount
  useEffect(() => {
    loadEntrances();
  }, [loadEntrances]); // Depend on the memoized loadEntrances function

  return {
    entrances,
    isLoading,
    error,
    refetchEntrances: loadEntrances, // Expose refetch function
  };
};

export default useEntrances;
