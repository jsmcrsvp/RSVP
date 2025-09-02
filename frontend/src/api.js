// src/api.js
import axios from "axios";

// Base URL of your backend
const SERVER_URL = process.env.REACT_APP_BACKEND_SERVER_URL || "https://rsvp-bgol.onrender.com";

// Create an axios instance
const api = axios.create({
  baseURL: SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ensures cookies are sent if needed
});

// ======================= API Methods =======================

// Search member by ID
export const searchMember = async (member_id) => {
  try {
    const response = await api.post("/search_member", { member_id });
    return response.data;
  } catch (error) {
    // normalize errors
    if (error.response) {
      // server responded with status code out of 2xx
      throw new Error(error.response.data.message || "Server error");
    } else if (error.request) {
      // request made but no response
      throw new Error("No response from server");
    } else {
      // something else
      throw new Error(error.message);
    }
  }
};

// Add more API methods here as needed
// export const anotherApiCall = async (data) => { ... }

export default api;