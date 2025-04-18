// src/mobile/hooks/useMapViewpoint.js (New file)
import { useEffect } from 'react';

const useMapViewpoint = (mapRef, targetLocation, targetZoom) => {
  useEffect(() => {
    // Check if map, target, and coordinates are valid
    if (mapRef.current && targetLocation &&
        typeof targetLocation.lat === 'number' &&
        typeof targetLocation.lng === 'number') {

      console.log("Updating map viewpoint via hook:", targetLocation);
      mapRef.current.panTo({ lat: targetLocation.lat, lng: targetLocation.lng });

      // Only set zoom if a valid targetZoom is provided
      if (typeof targetZoom === 'number') {
        mapRef.current.setZoom(targetZoom);
      }
    }
    // Dependencies: Run when the target location, zoom, or map instance changes
  }, [mapRef, targetLocation, targetZoom]);

  // This hook doesn't need to return anything, it just performs an effect
};

export default useMapViewpoint;

// Then, in MapOverlays.js:
// ...
// const { mapRef } = useContext(MapContext);
// const [selectedMarker, setSelectedMarker] = useState(null);
// ...
// useMapViewpoint(mapRef, selectedMarker, 18); // Use the hook
// Remove the old useEffect for pan/zoom
