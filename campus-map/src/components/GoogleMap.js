import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Polyline, Marker, Polygon } from "@react-google-maps/api";

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
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    // Function to fetch route from Flask API
  const fetchRoute = async () => {
    if (!origin || !destination) return;
    
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/get_route?start=${origin.lat},${origin.lng}&end=${destination.lat},${destination.lng}`
      );
      console.log(response);
      const data = await response.json();
      
      if (data.route) {
        // Convert the route data to the format Google Maps expects
        setRoute(data.route.map(coord => ({ lat: coord[0], lng: coord[1] })));
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  // REMOVE LATER

  // Example: Set some sample points and fetch a route
  useEffect(() => {
    // These would normally come from user interaction
    setOrigin({ lat: 33.9416, lng: -84.5199 });
    setDestination({ lat: 33.9400, lng: -84.5180 });
  }, []);

  // Fetch the route whenever origin or destination changes
  useEffect(() => {
    fetchRoute();
  }, [origin, destination]);

  // REMOVE LATER

  if (!apiKey) {
    console.log(process.env);
    console.error("Google Maps API Key is missing. Please check your .env file.");
    return <div className="text-red-500">Error: Missing Google Maps API Key</div>;
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap 
        mapContainerStyle={mapContainerStyle} 
        center={center} 
        zoom={16}
        options={{
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeControl: true,
          zoomControl: true,
          restriction: {
            latLngBounds: {
              north: 33.943,
              south: 33.934,
              east: -84.511,
              west: -84.526
            },
            strictBounds: true
          }
        }}>
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
        
        {/* Origin and destination markers removed as requested */}
        
        {/* Campus Boundary Polygon - invisible but still restricts the map */}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapsComponent;
