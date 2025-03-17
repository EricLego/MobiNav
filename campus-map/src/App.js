import React from 'react';
import { PlasmicRootProvider } from "@plasmicapp/react-web";
import GoogleMapsComponent from "./components/GoogleMap";

// Conditionally import Plasmic components if available
let PlasmicMobiNavMap = null;
try {
  // Attempt to dynamically import the Plasmic component
  PlasmicMobiNavMap = require("./plasmic/mobi_nav/PlasmicMobiNavMap").PlasmicMobiNavMap;
} catch (e) {
  console.warn("Plasmic component not found. Using fallback layout.", e);
}

function App() {
  return (
    <PlasmicRootProvider>
      <div className="App">
        <header className="App-header">
          <h1>MobiNav - Campus Navigation</h1>
        </header>
        <main>
          {/* Render Plasmic component if available, otherwise skip it */}
          {PlasmicMobiNavMap && <PlasmicMobiNavMap />}
          <GoogleMapsComponent />
        </main>
      </div>
    </PlasmicRootProvider>
  );
}

export default App;
