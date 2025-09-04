import axios from "axios";

const SERVER_URL =
  process.env.REACT_APP_BACKEND_SERVER_URL || "https://rsvp-bgol.onrender.com";

const api = axios.create({
  baseURL: SERVER_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Existing API calls
export const searchMember = async (payload) => {
  const res = await api.post("/search_member", payload);
  return res.data;
};

export const addProgram = async (payload) => {
  const res = await api.post("/api/programs", payload);
  return res.data;
};

export const submitRSVP = async (payload) => {
  const res = await api.post("/api/rsvp", payload);
  return res.data;
};

// ✅ NEW: Get Open Events
export const getOpenEvents = async () => {
  const res = await api.get("/api/programs/open");
  return res.data; // should return array of events with eventstatus = "Open"
};

export default api;



/* ========= Working 090325 10pm ====================
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
  const res = await axios.post(`${SERVER_URL}/api/programs`, payload, {
    headers: { "Content-Type": "application/json" }
  });
  return res.data;
};

export default api;
*/