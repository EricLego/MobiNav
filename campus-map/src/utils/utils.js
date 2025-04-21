// Helper function for handling fetch responses and errors
export const handleResponse = async (response) => {
    if (!response.ok) {
      let errorData = {};
      try {
        // Try to parse error details from the response body
        errorData = await response.json();
      } catch (e) {
        // Ignore if response body is not JSON or empty
      }
      console.error("API Error Response:", response.status, errorData);
      // Use the error message from the backend if available, otherwise use statusText
      const errorMessage = errorData.error || errorData.message || response.statusText;
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
    }
    // Handle cases where the response might be empty (e.g., DELETE returning 200/204 OK with no body)
    const contentType = response.headers.get("content-type");
    if (response.status === 204) { // No Content
      return {}; // Return empty object for successful No Content responses
    }
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    // If response is OK but not JSON (e.g., simple text message from DELETE)
    return response.text().then(text => ({ message: text }));
  };