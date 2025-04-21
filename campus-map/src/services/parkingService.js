import { handleResponse } from '../utils/utils';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';



// --- Parking Lot CRUD ---

/**
 * Fetches all parking lots from the API.
 * @returns {Promise<Array<Object>>} A promise resolving to an array of parking lot objects.
 */
export const fetchParkingLots = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parking_lots`);
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching parking lots:", error);
    // Re-throw the error so the calling component/hook can handle it
    throw error;
  }
};

/**
 * Fetches a specific parking lot by its ID.
 * @param {number|string} lotId - The ID of the parking lot to fetch.
 * @returns {Promise<Object>} A promise resolving to the parking lot object.
 */
export const fetchParkingLot = async (lotId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parking_lots/${lotId}`);
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching parking lot ${lotId}:`, error);
    throw error;
  }
};

/**
 * Creates a new parking lot.
 * @param {Object} lotData - The data for the new parking lot.
 * Expected fields: name (string, required), latitude (number, required),
 * longitude (number, required), permits (array of strings, optional), capacity (number, optional).
 * @returns {Promise<Object>} A promise resolving to the newly created parking lot object.
 */
export const createParkingLot = async (lotData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parking_lots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lotData),
    });
    // Expects 201 Created with the new lot data
    return handleResponse(response);
  } catch (error) {
    console.error("Error creating parking lot:", error);
    throw error;
  }
};

/**
 * Updates an existing parking lot.
 * @param {number|string} lotId - The ID of the parking lot to update.
 * @param {Object} lotData - The updated data for the parking lot. Can include any fields to update.
 * @returns {Promise<Object>} A promise resolving to the updated parking lot object.
 */
export const updateParkingLot = async (lotId, lotData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parking_lots/${lotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lotData),
    });
    // Expects 200 OK with the updated lot data
    return handleResponse(response);
  } catch (error) {
    console.error(`Error updating parking lot ${lotId}:`, error);
    throw error;
  }
};

/**
 * Deletes a parking lot.
 * @param {number|string} lotId - The ID of the parking lot to delete.
 * @returns {Promise<Object>} A promise resolving to an object, potentially with a success message.
 */
export const deleteParkingLot = async (lotId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parking_lots/${lotId}`, {
      method: 'DELETE',
    });
    // Expects 200 OK with message or 204 No Content
    return handleResponse(response);
  } catch (error) {
    console.error(`Error deleting parking lot ${lotId}:`, error);
    throw error;
  }
};
