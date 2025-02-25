import { PlasmicRootProvider } from "@plasmicapp/react-web";
import { PlasmicMobiNavMap } from "./plasmic/mobi_nav/PlasmicMobiNavMap"; // Corrected import
import GoogleMapsComponent from "./components/GoogleMap";

function App() {
  return (
    <PlasmicRootProvider>
      <PlasmicMobiNavMap />
      <GoogleMapsComponent />
    </PlasmicRootProvider>
  );
}

export default App;
