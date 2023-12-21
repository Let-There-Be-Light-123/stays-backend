const BASE_URL = '{$import.meta.env.VITE_API_BASE_URL}/api'; // Replace with your PHP backend URL

const handleResponse = (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
};

const apiService = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}/${endpoint}`);
      return handleResponse(response);
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  },

  post: async (endpoint, data) => {
    try {
      const response = await fetch(`${BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },
};

export default apiService;
