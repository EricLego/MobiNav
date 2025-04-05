import React, { useEffect, useRef, useState, forwardRef } from 'react';
import '../styles/BuildingAutocomplete.css';

const BuildingAutocomplete = forwardRef(({ 
    onPlaceSelect, 
    mapRef, 
    restrictToCampus = true,
    campusBoundary = null,
    placeholder = "Search for buildings, parking, etc...",
    isRouteSelector = false,
    routePointType = null
  }, ref) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

    // Expose the input reference to the parent component
    React.useImperativeHandle(ref, () => ({
        clear: () => {
          if (inputRef.current) {
            console.log("Clearing input field");
            inputRef.current.value = '';
          }
        }
      }));

    useEffect(() => {
    // Only set up autocomplete if Google Maps API is loaded
    if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete();
        setIsLoaded(true);
    } else {
        // Google Maps API not available yet, set up a listener for when it loads
        const checkGoogleExists = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
            clearInterval(checkGoogleExists);
            initializeAutocomplete();
            setIsLoaded(true);
        }
        }, 100);

        // Clean up interval on component unmount
        return () => clearInterval(checkGoogleExists);
    }
    }, []);


    useEffect(() => {
        if (!isLoaded || !autocompleteRef.current) return;
    
        if (restrictToCampus && campusBoundary) {
        // Create a bounds object from the campus boundary
        const bounds = new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(campusBoundary.south, campusBoundary.west),
            new window.google.maps.LatLng(campusBoundary.north, campusBoundary.east)
        );
    
        console.log("Setting strict bounds:", bounds.toString());
        autocompleteRef.current.setBounds(bounds);
        }
    }, [isLoaded, restrictToCampus, campusBoundary]);

  const initializeAutocomplete = () => {
    if (!inputRef.current) return;

    try {
      // Create the autocomplete object
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['school', 'university', 'library', 'gym', 'parking'],
        componentRestrictions: { country: 'us' },
        strictBounds: true,
      });

      autocompleteRef.current = autocomplete;

      // Add place selection event listener
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry || !place.geometry.location) {
          console.warn("Place selected has no geometry");
          return;
        }
        
        // Create a more standardized place object that matches what our component expects
        const standardizedPlace = {
          displayName: place.name,
          formattedAddress: place.formatted_address,
          location: { 
            lat: place.geometry.location.lat(), 
            lng: place.geometry.location.lng() 
          },
          viewport: place.geometry.viewport ? {
            north: place.geometry.viewport.getNorthEast().lat(),
            east: place.geometry.viewport.getNorthEast().lng(),
            south: place.geometry.viewport.getSouthWest().lat(),
            west: place.geometry.viewport.getSouthWest().lng()
          } : null,
          placeId: place.place_id,
          types: place.types,
          // Add other properties you might need
        };
        
        // Pass the selected place back to the parent component
        if (onPlaceSelect && typeof onPlaceSelect === 'function') {
          onPlaceSelect(standardizedPlace);
        }
      });
    } catch (error) {
      console.error("Error initializing Place Autocomplete:", error);
    }
  };

  return (
    <div className="building-autocomplete-container">
      <div className="building-autocomplete-card">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="autocomplete-input"
          aria-label="Search for buildings, parking, and other campus locations"
        />
      </div>
    </div>
  );
});

export default BuildingAutocomplete;