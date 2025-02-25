import React from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "600px", // Adjust to match Plasmic container
};

const center = {
  lat: 33.9416, // KSU Marietta Campus Latitude
  lng: -84.5199, // Longitude
};

const GoogleMapsComponent = () => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY; // Fetch API key from .env

  if (!apiKey) {
    console.error("Google Maps API Key is missing. Please check your .env file.");
    return <div className="text-red-500">Error: Missing Google Maps API Key</div>;
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={16} />
    </LoadScript>
  );
};

export default GoogleMapsComponent;
