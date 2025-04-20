// src/mobile/hooks/useGeolocation.js
import { useState, useEffect, useRef } from 'react';

const defaultOptions = {
	enableHighAccuracy: true,
	timeout: 50000, // 5 seconds
	maximumAge: 0, // Don't use cached position
};

const useGeolocation = (options = defaultOptions, watch = true) => { // Added 'watch' flag
  const [coords, setCoords] = useState(null); // { lat, lng, accuracy, heading, speed, timestamp } | null
	const [isLocating, setIsLocating] = useState(watch); // Start as locating if watching
	const [locationError, setLocationError] = useState(null);
	const [isSupported, setIsSupported] = useState(true);
	const watchIdRef = useRef(null); // Ref to store the watch ID

	useEffect(() => {
		if (!navigator.geolocation) {
			setLocationError(new Error('Geolocation is not supported by your browser.'));
			setIsSupported(false);
			setIsLocating(false);
			return; // Stop if not supported
		}

		// --- Function to handle successful position updates ---
		const handleSuccess = (position) => {
			console.log("Geolocation update received:", position.coords);
			setCoords({
				lat: position.coords.latitude,
				lng: position.coords.longitude,
				accuracy: position.coords.accuracy,
				// --- Include heading and speed if available ---
				heading: position.coords.heading, // Degrees clockwise from North, null if unavailable
				speed: position.coords.speed,		 // Meters per second, null if unavailable
				// ---------------------------------------------
				timestamp: position.timestamp,
			});
			setLocationError(null);
			setIsLocating(false); // Mark as not locating after first successful update
		};

		// --- Function to handle errors ---
		const handleError = (error) => {
			console.error("Geolocation error:", error);
			setLocationError(error);
			// Don't clear coords on temporary errors during watch? Maybe debatable.
			// setCoords(null);
			setIsLocating(false); // Stop showing locating on error
		};

		// --- Start watching if requested ---
		if (watch && isSupported) {
			setIsLocating(true); // Ensure locating is true when starting watch
			console.log("Starting geolocation watch...");
			watchIdRef.current = navigator.geolocation.watchPosition(
				handleSuccess,
				handleError,
				options
			);
		} else {
				setIsLocating(false); // Not watching, not locating
		}

		// --- Cleanup function: Clear the watch ---
		return () => {
			if (watchIdRef.current !== null) {
				console.log("Clearing geolocation watch...");
				navigator.geolocation.clearWatch(watchIdRef.current);
				watchIdRef.current = null;
			}
		};
		// Re-run effect if options or watch flag change
	}, [options, watch, isSupported]);

	return { coords, isLocating, locationError, isSupported };

}


/**
 * Defines the approximate boundary of the KSU Marietta campus.
 * Coordinates should be in [longitude, latitude] format for some algorithms,
 * but we'll use { lat, lng } for consistency with Google Maps.
 * Adjust these coordinates for better accuracy.
 */
const KSU_MARIETTA_CAMPUS_BOUNDARY = [
	{ lat: 33.941486, lng: -84.524504 }, // NW corner (approx)
	{ lat: 33.941486, lng: -84.512786 }, // NE corner (approx)
	{ lat: 33.935673, lng: -84.512786 }, // SE corner (approx)
	{ lat: 33.935673, lng: -84.524504 }, // SW corner (approx)
	{ lat: 33.941486, lng: -84.524504 }	// Closing point (same as first)
];

/**
 * Checks if a point is inside a given polygon using the ray casting algorithm.
 * @param {{lat: number, lng: number}} point The user's coordinates.
 * @param {Array<{lat: number, lng: number}>} polygon An array of coordinates defining the polygon vertices in order. The last point should be the same as the first.
 * @returns {boolean} True if the point is inside the polygon, false otherwise.
 */
const isPointInPolygon = (point, polygon) => {
	if (!point || typeof point.lat !== 'number' || typeof point.lng !== 'number') {
		return false; // Invalid point
	}
	if (!polygon || polygon.length < 4) {
		return false; // Invalid polygon (needs at least 3 unique vertices + closing point)
	}

	const x = point.lng; // Use longitude for x
	const y = point.lat; // Use latitude for y
	let isInside = false;

	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i].lng;
		const yi = polygon[i].lat;
		const xj = polygon[j].lng;
		const yj = polygon[j].lat;

		// Check if the point is on a horizontal boundary edge (handle carefully or exclude)
		// if (y === yi && y === yj && ((x >= xi && x <= xj) || (x >= xj && x <= xi))) {
		//		return true; // Point is on a horizontal boundary
		// }
		// Check if the point is on a vertical boundary edge (handle carefully or exclude)
		// if (x === xi && x === xj && ((y >= yi && y <= yj) || (y >= yj && y <= yi))) {
		//		return true; // Point is on a vertical boundary
		// }

		const intersect = ((yi > y) !== (yj > y))
				&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) {
			isInside = !isInside;
		}
	}

	return isInside;
};

/**
 * Checks if the user's coordinates are within the defined KSU Marietta campus boundary.
 * @param {{lat: number, lng: number} | null} userCoords The user's coordinates.
 * @returns {boolean} True if the user is on campus, false otherwise.
 */
export const isUserOnCampus = (userCoords) => {
	return isPointInPolygon(userCoords, KSU_MARIETTA_CAMPUS_BOUNDARY);
};


export default useGeolocation;