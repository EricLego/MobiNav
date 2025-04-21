import { handleResponse } from '../utils/utils';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// --- Building CRUD ---
export const fetchBuildings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buildings`);
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching buildings:", error);
    throw error;
  }
};

export const fetchBuilding = async (buildingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}`);
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching building ${buildingId}:`, error);
    throw error;
  }
};

export const createBuilding = async (buildingData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buildings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildingData),
    });
    return handleResponse(response); // Expects 201 Created with building data
  } catch (error) {
    console.error("Error creating building:", error);
    throw error;
  }
};

export const updateBuilding = async (buildingId, buildingData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildingData),
    });
    return handleResponse(response); // Expects 200 OK with updated building data
  } catch (error) {
    console.error(`Error updating building ${buildingId}:`, error);
    throw error;
  }
};

export const deleteBuilding = async (buildingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}`, {
      method: 'DELETE',
    });
    return handleResponse(response); // Expects 200 OK with message or 204 No Content
  } catch (error) {
    console.error(`Error deleting building ${buildingId}:`, error);
    throw error;
  }
};

// --- Entrance CRUD ---
export const fetchEntrances = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/entrances`);
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching entrances:", error);
    throw error;
  }
};

export const fetchEntrance = async (entranceId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/entrances/${entranceId}`);
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching entrance ${entranceId}:`, error);
    throw error;
  }
};

export const createEntrance = async (entranceData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/entrances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entranceData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error creating entrance:", error);
    throw error;
  }
};

export const updateEntrance = async (entranceId, entranceData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/entrances/${entranceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entranceData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error updating entrance ${entranceId}:`, error);
    throw error;
  }
};

export const deleteEntrance = async (entranceId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/entrances/${entranceId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error deleting entrance ${entranceId}:`, error);
    throw error;
  }
};

// --- Path CRUD ---
export const fetchPaths = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/paths`);
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching paths:", error);
    throw error;
  }
};

export const fetchPath = async (pathId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/paths/${pathId}`);
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching path ${pathId}:`, error);
    throw error;
  }
};

export const createPath = async (pathData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/paths`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pathData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error creating path:", error);
    throw error;
  }
};

export const updatePath = async (pathId, pathData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/paths/${pathId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pathData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error updating path ${pathId}:`, error);
    throw error;
  }
};

export const deletePath = async (pathId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/paths/${pathId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error deleting path ${pathId}:`, error);
    throw error;
  }
};

// --- Obstacle CRUD ---
export const fetchObstacles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/obstacles`);
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching obstacles:", error);
    throw error;
  }
};

export const fetchObstacle = async (obstacleId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/obstacles/${obstacleId}`);
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching obstacle ${obstacleId}:`, error);
    throw error;
  }
};

export const submitObstacleReport = async (obstacleData) => {
  return createObstacle(obstacleData);
}

export const createObstacle = async (obstacleData) => {
  try {
    // Ensure reported_at is set if not provided
    const dataToSend = {
        ...obstacleData,
        reported_at: obstacleData.reported_at || new Date().toISOString()
    };
    const response = await fetch(`${API_BASE_URL}/api/obstacles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend),
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error creating obstacle:", error);
    throw error;
  }
};

export const updateObstacle = async (obstacleId, obstacleData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/obstacles/${obstacleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obstacleData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error updating obstacle ${obstacleId}:`, error);
    throw error;
  }
};

export const deleteObstacle = async (obstacleId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/obstacles/${obstacleId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error deleting obstacle ${obstacleId}:`, error);
    throw error;
  }
};

// --- Routing ---
/**
 * Fetches a route from the backend.
 * @param {object} startCoords - { lat, lng }
 * @param {object} endCoords - { lat, lng }
 * @param {object} params - Additional parameters (e.g., accessibility settings like preferRamps, mobilityScore)
 * @returns {Promise<Object>} A promise resolving to the route data (geometry, instructions, etc.)
 */
export const fetchRoute = async (startCoords, endCoords, params = {}) => {
  try {
    // Construct query parameters
    const queryParams = new URLSearchParams({
      start: `${startCoords.lat},${startCoords.lng}`,
      end: `${endCoords.lat},${endCoords.lng}`,
      ...params // Spread any additional params like accessibility score, preferRamps etc.
    });

    const response = await fetch(`${API_BASE_URL}/api/get_route?${queryParams.toString()}`);
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching route:", error);
    throw error;
  }
};

// --- Add other specific fetches as needed ---
// Example: Fetch entrances for a specific building
export const fetchBuildingEntrances = async (buildingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/entrances`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching entrances for building ${buildingId}:`, error);
      throw error;
    }
  };

// --- Google Maps Specific Services ---

/**
 * Fetches place predictions from Google Places Autocomplete service.
 * @param {string} query - The user's search input.
 * @param {google.maps.LatLngBoundsLiteral} bounds - Optional bounds to bias results (e.g., campus area).
 * @returns {Promise<Array<Object>>} A promise resolving to an array of prediction objects.
 */
export const fetchGooglePlacesSuggestions = async (query, bounds = null) => {
    // Ensure Google Maps API is loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error("Google Maps Places API not available.");
      // Return empty array or throw error, depending on desired handling
      return [];
      // Or: throw new Error("Google Maps Places API not available.");
    }
  
    const autocompleteService = new window.google.maps.places.AutocompleteService();
  
    const requestOptions = {
      input: query,
      ...(bounds && { locationRestriction: bounds }),
      types: ['establishment'] // Example: only search for businesses/points of interest
    };
  
    return new Promise((resolve, reject) => {
      autocompleteService.getPlacePredictions(requestOptions, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          // Format results slightly to be consistent (add type, maybe simplify)
          const formattedPredictions = predictions.map(p => ({
            id: p.place_id, // Use place_id as the unique ID
            name: p.description, // Use the full description as the name
            // Add other useful fields if needed
            structured_formatting: p.structured_formatting,
            types: p.types,
            type: 'google', // Add our own type identifier
            // Note: lat/lng are NOT typically available here
          }));
          resolve(formattedPredictions);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([]); // No results found is not an error
        } else {
          console.error("Google Places Autocomplete request failed:", status);
          reject(new Error(`Places Autocomplete failed: ${status}`));
        }
      });
    });
  };
  
  
  /**
   * Fetches detailed information for a place using its Place ID.
   * @param {string} placeId - The Google Place ID.
   * @param {google.maps.Map} mapInstance - The map instance (needed for PlacesService).
   * @returns {Promise<Object>} A promise resolving to the place details object (including geometry).
   */
  export const fetchPlaceDetails = async (placeId, mapInstance) => {
      if (!window.google || !window.google.maps || !window.google.maps.places || !mapInstance) {
          console.error("Google Maps Places API or map instance not available.");
          throw new Error("Google Maps Places API or map instance not available.");
      }
  
      const placesService = new window.google.maps.places.PlacesService(mapInstance);
      // Specify which fields you want (geometry is crucial for lat/lng)
      const request = {
          placeId: placeId,
          fields: ['name', 'place_id', 'geometry', 'formatted_address', 'types'] // Add more fields as needed
      };
  
      return new Promise((resolve, reject) => {
          placesService.getDetails(request, (place, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                  // Format the result to include lat/lng directly
                  const details = {
                      id: place.place_id,
                      name: place.name,
                      lat: place.geometry?.location?.lat(), // Extract lat
                      lng: place.geometry?.location?.lng(), // Extract lng
                      formattedAddress: place.formatted_address,
                      types: place.types,
                      type: 'google_details' // Indicate it's full details
                  };
                  resolve(details);
              } else {
                  console.error("Google Places Details request failed:", status);
                  reject(new Error(`Places Details failed: ${status}`));
              }
          });
      });
  };

// --- Indoor View Specific Services ---

/**
 * Fetches indoor view details for a specific building, including its available floors.
 * @param {string|number} buildingId - The ID of the building.
 * @returns {Promise<Object>} A promise resolving to the building's indoor details (e.g., { buildingId, name, floors: [{level, name, isDefault}, ...] }).
 */
export const fetchIndoorBuildingData = async (buildingId) => {
  try {
    // Assuming an endpoint like /api/buildings/{buildingId}/indoor exists
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/indoor`);
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching indoor data for building ${buildingId}:`, error);
    throw error;
  }
};

/**
* Fetches the GeoJSON floor plan for a specific floor level of a building.
* @param {string|number} buildingId - The ID of the building.
* @param {string|number} floorLevel - The level identifier of the floor.
* @returns {Promise<Object>} A promise resolving to the GeoJSON object for the floor plan.
*/
export const fetchFloorPlan = async (buildingId, floorLevel) => {
  try {
    // Assuming an endpoint like /api/buildings/{buildingId}/floors/{floorLevel} exists
    // Or potentially /api/floorplans/{buildingId}/{floorLevel}
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/floors/${floorLevel}`);
    return handleResponse(response); // Expects the response body to be the GeoJSON
  } catch (error) {
    console.error(`Error fetching floor plan for building ${buildingId}, level ${floorLevel}:`, error);
    throw error;
  }
};

// --- Accessibility Feature CRUD ---

/**
 * Fetches all accessibility features from the API.
 * @returns {Promise<Array<Object>>} A promise resolving to an array of accessibility feature objects.
 */
export const fetchAccessibilityFeatures = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/accessibility_features`); // Assuming this endpoint
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching accessibility features:", error);
    throw error;
  }
};

/**
 * Fetches a specific accessibility feature by its ID.
 * @param {number|string} featureId - The ID of the feature to fetch.
 * @returns {Promise<Object>} A promise resolving to the accessibility feature object.
 */
export const fetchAccessibilityFeature = async (featureId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/accessibility_features/${featureId}`); // Assuming this endpoint
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching accessibility feature ${featureId}:`, error);
    throw error;
  }
};

/**
 * Creates a new accessibility feature.
 * @param {Object} featureData - The data for the new feature.
 * Expected fields: latitude, longitude, feature_type, description (optional), building_id (optional), etc.
 * @returns {Promise<Object>} A promise resolving to the newly created feature object.
 */
export const createAccessibilityFeature = async (featureData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/accessibility_features`, { // Assuming this endpoint
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(featureData),
    });
    return handleResponse(response); // Expects 201 Created
  } catch (error) {
    console.error("Error creating accessibility feature:", error);
    throw error;
  }
};

/**
 * Updates an existing accessibility feature.
 * @param {number|string} featureId - The ID of the feature to update.
 * @param {Object} featureData - The updated data for the feature.
 * @returns {Promise<Object>} A promise resolving to the updated feature object.
 */
export const updateAccessibilityFeature = async (featureId, featureData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/accessibility_features/${featureId}`, { // Assuming this endpoint
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(featureData),
    });
    return handleResponse(response); // Expects 200 OK
  } catch (error) {
    console.error(`Error updating accessibility feature ${featureId}:`, error);
    throw error;
  }
};

/**
 * Deletes an accessibility feature.
 * @param {number|string} featureId - The ID of the feature to delete.
 * @returns {Promise<Object>} A promise resolving to an object, potentially with a success message.
 */
export const deleteAccessibilityFeature = async (featureId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/accessibility_features/${featureId}`, { // Assuming this endpoint
      method: 'DELETE',
    });
    return handleResponse(response); // Expects 200 OK or 204 No Content
  } catch (error) {
    console.error(`Error deleting accessibility feature ${featureId}:`, error);
    throw error;
  }
};
