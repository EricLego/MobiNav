// src/mobile/hooks/useBuildings.js
import { useState, useEffect } from 'react';
import { fetchBuildings } from '../services/mapService'; // Adjust path if needed

const useBuildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBuildings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchBuildings();
        // Ensure lat/lng are numbers for the Marker component
        const formattedData = data.map(bldg => ({
            ...bldg,
            lat: parseFloat(bldg.latitude), // Convert from string/Decimal if needed
            lng: parseFloat(bldg.longitude), // Convert from string/Decimal if needed
            type: 'building' // Add a type for the InfoWindow later
        }));
        setBuildings(formattedData);
      } catch (err) {
        console.error("Failed to load buildings:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBuildings();
  }, []); // Empty dependency array means this runs once on mount

  return { buildings, isLoading, error };
};

export default useBuildings;
