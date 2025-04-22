// src/features/obstacles/hooks/useObstacles.js
import { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { fetchObstacles } from '../../../services/mapService'; // Adjust path if needed

const useObstacles = () => {
  const [obstacles, setObstacles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wrap the fetching logic in useCallback so we can return it
  const loadObstacles = useCallback(async () => {
    console.log("Executing loadObstacles..."); // Add log
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchObstacles();
      // Assuming the API returns lat/lng directly now based on previous context
      const formattedData = data.map(obs => ({
          ...obs,
          lat: parseFloat(obs.latitude),
          lng: parseFloat(obs.longitude),
          type: 'obstacle' // Add a type
      }));
      setObstacles(formattedData);
      console.log("Obstacles fetched and formatted:", formattedData); // Log success
    } catch (err) {
      console.error("Failed to load obstacles:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array: the function itself doesn't depend on props/state

  // Run loadObstacles on initial mount
  useEffect(() => {
    loadObstacles();
  }, [loadObstacles]); // Include loadObstacles in dependency array

  // Return the state and the function to trigger a refetch
  return {
      obstacles,
      isLoading,
      error,
      refetchObstacles: loadObstacles // Expose the fetching function
  };
};

export default useObstacles;
