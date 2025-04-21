// src/config/mapIcons.js

// Ensure window.google is available or handle potential loading issues
const google = window.google;

// Define base styles or common properties if needed
const baseIconStyle = {
    fillOpacity: 0.9,
    strokeWeight: 1,
    strokeColor: '#ffffff', // White outline for better visibility
    scale: 6, // Default scale
};

const icons = {
    building: {
        // Example: Simple square
        path: google?.maps.SymbolPath.FORWARD_CLOSED_ARROW, // Placeholder, maybe a square? google.maps.SymbolPath doesn't have a square
        fillColor: '#8B4513', // Brown
        ...baseIconStyle,
        scale: 7, // Slightly larger
        // rotation: 0, // Can specify rotation
    },
    entrance: {
        // Example: Diamond
        path: google?.maps.SymbolPath.FORWARD_CLOSED_ARROW, // Placeholder, maybe a diamond?
        fillColor: '#4682B4', // Steel Blue
        ...baseIconStyle,
        scale: 5,
    },
    obstacle: {
        // Example: Triangle (warning)
        path: google?.maps.SymbolPath.FORWARD_CLOSED_ARROW, // Placeholder, maybe a triangle?
        fillColor: '#FF0000', // Red
        ...baseIconStyle,
        scale: 6,
    },
    parkingLot: {
        // Example: Circle (using BACKWARD_CLOSED_ARROW as placeholder)
        path: google?.maps.SymbolPath.BACKWARD_CLOSED_ARROW, // Placeholder for a 'P' or circle
        fillColor: '#0000FF', // Blue
        ...baseIconStyle,
        scale: 7,
    },
    default: {
        // Fallback icon
        path: google?.maps.SymbolPath.CIRCLE,
        fillColor: '#777777', // Gray
        ...baseIconStyle,
        scale: 5,
    }
};

/**
 * Gets the Google Maps icon configuration for a given map item type.
 * @param {string} itemType - The type of the map item (e.g., 'building', 'entrance').
 * @returns {google.maps.Symbol | google.maps.Icon | undefined} The icon configuration or undefined.
 */
export const getMapIcon = (itemType) => {
    if (!google || !google.maps) {
        console.warn("Google Maps API not loaded yet for icon retrieval.");
        return undefined; // Return undefined if google maps isn't ready
    }
    // Return the specific icon or the default if not found
    return icons[itemType] || icons.default;
};

// Optional: Export the raw icons object if needed elsewhere
export const mapIconDefinitions = icons;

// --- Notes on Placeholders ---
// google.maps.SymbolPath has limited built-in shapes (CIRCLE, BACKWARD_CLOSED_ARROW, FORWARD_CLOSED_ARROW, BACKWARD_OPEN_ARROW, FORWARD_OPEN_ARROW).
// For custom shapes like squares, diamonds, or letters ('P'), you would typically use:
// 1. SVG Paths: Define the `path` property as an SVG path string (e.g., 'M -1,0 L 1,0 L 0,1 Z' for a triangle).
// 2. Image URLs: Use the `url` property within an `Icon` object literal: `{ url: '/path/to/icon.png', scaledSize: new google.maps.Size(20, 20) }`.
