// src/mobile/hooks/useObstacles.js
import { useState, useEffect } from 'react';
import { fetchObstacles } from '../services/mapService'; // Adjust path if needed

const useObstacles = () => {
  const [obstacles, setObstacles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadObstacles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchObstacles();
        // TODO: Need to determine obstacle lat/lng.
        // The current Obstacle model doesn't have lat/lng directly.
        // We might need to fetch related building/entrance/path data
        // OR modify the backend API to return coordinates.
        // For now, let's assume the API *will* return lat/lng.
        const formattedData = data.map(obs => ({
            ...obs,
            // Assuming backend provides these directly or via joins:
            lat: parseFloat(obs.latitude), // Placeholder - adjust based on actual API response
            lng: parseFloat(obs.longitude), // Placeholder - adjust based on actual API response
            type: 'obstacle' // Add a type
        }));
        setObstacles(formattedData);
        console.log(formattedData);
      } catch (err) {
        console.error("Failed to load obstacles:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadObstacles();
  }, []); // Empty dependency array means this runs once on mount

  return { obstacles, isLoading, error };
};

export default useObstacles;
