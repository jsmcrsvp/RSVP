import axios from "axios";

const SERVER_URL = process.env.REACT_APP_BACKEND_SERVER_URL || "https://rsvp-bgol.onrender.com";

const api = axios.create({
  baseURL: SERVER_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Member Search
export const searchMember = async (payload) => {
  const res = await api.post("/search_member", payload);
  return res.data;
};

// Add Program
export const addProgram = async (payload) => {
  try {
    const response = await api.post("/api/programs", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "API Error");
  }
};

export default api;
