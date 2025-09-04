import axios from "axios";

const SERVER_URL = process.env.REACT_APP_BACKEND_SERVER_URL || "https://jsmcrsvp.onrender.com";

const api = axios.create({
  baseURL: SERVER_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Fetch all open events
export const getOpenEvents = async () => {
  try {
    const res = await api.get("/api/programs/open");
    return res.data; // should return an array of open events
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch open events");
  }
};

// Search member by memberId or name + houseNumber
export const searchMember = async (payload) => {
  try {
    const res = await api.post("/search_member", payload);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Member not found");
  }
};

// Submit RSVP
export const submitRSVP = async (payload) => {
  try {
    const res = await api.post("/api/rsvp", payload);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to submit RSVP");
  }
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