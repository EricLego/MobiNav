import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Polyline, Marker, Polyline, Marker, Polygon } from "@react-google-maps/api";
import PlaceAutocomplete from "./SearchBar";

const mapContainerStyle = {
  width: "100%",
  height: "600px", // Adjust to match Plasmic container
};

const center = {
  lat: 33.9386, // KSU Marietta Campus (center point of the polygon)
  lng: -84.5187, // Longitude
};

// KSU Marietta Campus boundary polygon
const campusBoundary = [
  { lat: 33.940912, lng: -84.524504 }, // NW
  { lat: 33.941486, lng: -84.515582 }, // NE
  { lat: 33.935908, lng: -84.512786 }, // SE
  { lat: 33.935673, lng: -84.524473 }, // SW
  { lat: 33.940912, lng: -84.524504 }, // NW (close the polygon)
];

const GoogleMapsComponent = () => {
  const [route, setRoute] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // Fetch API key from .env

  console.log(apiKey);
  console.log(process.env);

  useEffect(() => {
    // These would normally come from user interaction
    setOrigin({ lat: 33.9416, lng: -84.5199 });
    setDestination({ lat: 33.9400, lng: -84.5180 });
  }, []);

    // Fetch the route whenever origin or destination changes
  useEffect(() => {
    fetchRoute();
  }, [origin, destination]);


  if (!apiKey) {
    console.log(process.env);
    console.error("Google Maps API Key is missing. Please check your .env file.");
    return <div className="text-red-500">Error: Missing Google Maps API Key</div>;
  }

  
    // Function to fetch route from your Flask API
  const fetchRoute = async () => {
    if (!origin || !destination) return;
    
    try {
      const response = await fetch(
        `/api/get_route?start=${origin.lat},${origin.lng}&end=${destination.lat},${destination.lng}`
      );
      console.log(response);
      const data = await response.json();
      console.log(data);
      
      if (data.route) {
        // Convert the route data to the format Google Maps expects
        setRoute(data.route.map(coord => ({ lat: coord[0], lng: coord[1] })));
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const handleOriginSelect = (place) => {
    // Will be implemented with Google Places Autocomplete
    console.log("Origin selected:", place);
    if (place && place.geometry && place.geometry.location) {
      setOrigin({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      });
    }
  };

  const handleDestinationSelect = (place) => {
    // Will be implemented with Google Places Autocomplete
    console.log("Destination selected:", place);
    if (place && place.geometry && place.geometry.location) {
      setDestination({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      });
    }
  };

  return (
    <div className="map-container">
      <div className="search-controls mb-4 flex flex-col md:flex-row gap-2">
        <PlaceAutocomplete 
          placeholder="Enter origin location" 
          onPlaceSelect={handleOriginSelect} 
        />
        <PlaceAutocomplete 
          placeholder="Enter destination" 
          onPlaceSelect={handleDestinationSelect} 
        />
      </div>
      
      <LoadScript googleMapsApiKey={apiKey} libraries={["places"]}>
        <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={16}>
          {/* Display the route as a polyline */}
          {route.length > 0 && (
            <Polyline
              path={route}
              options={{
                strokeColor: "#0000FF",
                strokeOpacity: 1,
                strokeWeight: 5,
              }}
            />
          )}
          
          {/* Display markers for origin and destination */}
          {origin && <Marker position={origin} />}
          {destination && <Marker position={destination} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default GoogleMapsComponent;
