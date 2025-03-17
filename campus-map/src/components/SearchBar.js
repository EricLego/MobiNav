import React, {useRef, useEffect, useState} from 'react';
import {useMapsLibrary} from '@vis.gl/react-google-maps';

const PlaceAutocomplete = ({onPlaceSelect}) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;
    
    console.log("Places library loaded, creating autocomplete");
    
    const options = {
      fields: ['geometry', 'name', 'formatted_address']
    };
    
    try {
      const autocompleteInstance = new places.Autocomplete(inputRef.current, options);
      setPlaceAutocomplete(autocompleteInstance);
      console.log("Autocomplete instance created successfully");
    } catch (error) {
      console.error("Error creating autocomplete:", error);
    }
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;
    
    console.log("Setting up place_changed listener");
    
    const listener = placeAutocomplete.addListener('place_changed', () => {
      console.log("Place changed event triggered");
      const place = placeAutocomplete.getPlace();
      console.log("Selected place:", place);
      onPlaceSelect(place);
    });
    
    // Clean up the listener when component unmounts or when placeAutocomplete changes
    return () => {
      if (listener) {
        console.log("Removing place_changed listener");
        listener.remove();
      }
    };
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div className="autocomplete-container">
      <input 
        ref={inputRef} 
        placeholder="Search for a place"
        style={{ width: '100%', padding: '8px' }}
      />
    </div>
  );
};

export default PlaceAutocomplete;