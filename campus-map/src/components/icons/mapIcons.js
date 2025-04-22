/**
 * Gets the Google Maps icon configuration for a given map item type.
 * Ensures Google Maps API is loaded before defining/returning icons.
 * @param {string} itemType - The type of the map item (e.g., 'building', 'entrance', 'user').
 * @returns {google.maps.Symbol | google.maps.Icon | undefined} The icon configuration or undefined.
 */
export const getMapIcon = (itemType) => {
    // Check for window.google *inside* the function call
    if (!window.google || !window.google.maps) {
        console.warn("Google Maps API not ready for icon retrieval.");
        return undefined; // Return undefined if google maps isn't ready
    }

    // Define base styles and icons *inside* the function, now that google.maps is confirmed
    const google = window.google; // Safe to assign now
    const baseIconStyle = {
        fillOpacity: 0.9,
        strokeWeight: 1,
        strokeColor: '#ffffff', // White outline for better visibility
        scale: 6, // Default scale
    };

    const icons = {
        building: {
            path: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z",
            fillColor: '#0033a0', // KSU Navy Blue
            fillOpacity: 1,
            strokeWeight: 0,
            rotation: 0,
            scale: 1.1,
            anchor: new google.maps.Point(12, 12), // Center the building icon
        },
        entrance: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FFC107', // Amber/Yellow
            fillOpacity: 1,
            strokeColor: '#000000',
            strokeWeight: 1,
            scale: 7,
            // Circle's default anchor is the center, usually okay
        },
        obstacle: {
            path: "M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3s.58-1.3 1.3-1.3 1.3.58 1.3 1.3-.58 1.3-1.3 1.3zm0-4.3c-.72 0-1.3-.58-1.3-1.3V8c0-.72.58-1.3 1.3-1.3s1.3.58 1.3 1.3v3.7c0 .72-.58 1.3-1.3 1.3z",
            fillColor: '#DB4437', // Red
            fillOpacity: 1,
            strokeWeight: 0,
            rotation: 0,
            scale: 1.0,
            anchor: new google.maps.Point(12, 12), // Center the warning icon
        },
        parkingLot: {
            // Using a simple square as a placeholder for 'P'
            path: 'M -5,-5 L 5,-5 L 5,5 L -5,5 Z', // Simple square path
            fillColor: '#4285F4', // Google Blue
            strokeColor: '#FFFFFF',
            strokeWeight: 1,
            fillOpacity: 0.9,
            scale: 1.2, // Make slightly larger than default base scale
             anchor: new google.maps.Point(0, 0), // Center the square
        },
         accessibilityFeature: { // Added definition
            path: google.maps.SymbolPath.CIRCLE, // Placeholder - consider a specific SVG
            fillColor: '#0F9D58', // Google Green
            ...baseIconStyle,
            scale: 7,
        },
        user: { // Added definition for user location
             path: google.maps.SymbolPath.CIRCLE,
             fillColor: '#4285F4', // Blue like in MapOverlays
             fillOpacity: 1,
             strokeColor: '#FFFFFF',
             strokeWeight: 2,
             scale: 8,
        },
        default: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#777777', // Gray
            ...baseIconStyle,
            scale: 5,
        }
    };

    // Return the specific icon or the default if not found
    return icons[itemType] || icons.default;
};

// --- REMOVE this export if not needed elsewhere ---
// export const mapIconDefinitions = icons;

// --- Notes remain the same ---
