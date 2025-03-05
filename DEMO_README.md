# MobiNav Demo Application

This is a demonstration prototype of the MobiNav campus navigation system for Kennesaw State University's Marietta campus. The demo showcases the core functionality of providing navigation routes between campus buildings.

## Features

- Interactive map centered on KSU Marietta Campus
- Selection of key campus buildings
- Point-to-point navigation between buildings
- Visual route display with distance and time estimates
- Mobile-responsive interface

## Setup Instructions

1. **Get a Google Maps API key**:
   - Visit the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Maps JavaScript API"
   - Create credentials and copy your API key

2. **Update the API key**:
   - Open `demo-index.html`
   - Replace `YOUR_API_KEY_HERE` with your actual Google Maps API key

3. **Run the demo**:
   - Option 1: Open `demo-index.html` directly in a browser
   - Option 2: Use the provided Node.js server:
     ```
     # Start the included Node.js server
     node serve-demo.js
     
     # Then open http://localhost:3000 in your browser
     ```
   - Option 3: Serve with another local server:
     ```
     # Using Python
     python -m http.server
     
     # Using npx
     npx serve
     ```

## How to Use

1. The map will load displaying markers for various campus buildings
2. Click on a building to select it as your starting point (turns green)
3. Click on another building to select it as your destination (turns red)
4. A route will automatically appear between the two buildings
5. Distance and estimated walking time information will be displayed
6. Click "Reset Selection" to start over

## Limitations

This is a prototype demonstration with the following limitations:
- Routes are simulated, not based on actual pedestrian paths
- Building locations are approximate
- No consideration for accessibility features, construction, or real-time updates in this demo

## Next Steps

The full MobiNav application will include:
- Accurate mapping of campus buildings and walkways
- Real-time updates about construction and obstacles
- Accessibility-optimized routing
- User accounts with saved routes
- Integration with campus events and schedules