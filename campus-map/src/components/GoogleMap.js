import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Polyline, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "85vh",
};

const center = {
  lat: 33.9416, // KSU Marietta Campus
  lng: -84.5199,
};

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
  );
};

export default GoogleMapsComponent;
