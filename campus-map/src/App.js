import React from "react";
import Dashboard from "./components/Dashboard";
import GoogleMapsComponent from "./components/GoogleMap";

function App() {
  return (
    <div className="h-screen flex flex-col">
      <Dashboard />
      <GoogleMapsComponent />
    </div>
  );
}

export default App;
