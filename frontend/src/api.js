import axios from "axios";

const SERVER_URL =
    process.env.REACT_APP_BACKEND_SERVER_URL || "http://localhost:3001";

const api = axios.create({
    baseURL: SERVER_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

// Member search
export const searchMember = async (payload) => {
    const res = await api.post("/search_member", payload);
    return res.data;
};

// Add program
export const addProgram = async (payload) => {
    const res = await api.post("/api/programs", payload);
    return res.data;
};

// Get open events
export const getOpenEvents = async () => {
    const res = await api.get("/api/programs/open");
    return res.data;
};

// Get closed events
export const getClosedEvents = async () => {
    const res = await api.get("/api/programs/closed");
    return res.data;
};

// Get all programs with events
export const getAllPrograms = async () => {
    const res = await api.get("/api/programs");
    return res.data;
};

// Submit RSVP
export const submitRSVP = async (payload) => {
    try {
        const response = await api.post("/api/rsvp_response", payload);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "API Error");
    }
};

// Verify RSVP by confirmation number
export const verifyRSVP = async (confNumber) => {
    const res = await api.get(`/api/rsvp_response/${confNumber}`);
    return res.data;
};

// Update RSVP count
export const updateRSVP = async (id, rsvpcount) => {
    const res = await api.put(`/api/rsvp_response/update_rsvp/${id}`, { rsvpcount });
    return res.data; // this will include { message, updated }
};

// Dashboard
export const getDashboardStats = async () => {
    const res = await api.get("/api/dashboard/stats");
    return res.data;
};

// Update event status
export const updateEventStatus = async (progId, evId, newStatus) => {
  const res = await api.put(`/api/programs/${progId}/events/${evId}/status`, {
    eventstatus: newStatus,
  });
  return res.data;
};

// Get all programs (admin)
export const getAdminPrograms = async () => {
  const res = await api.get("/api/programs-events/programs");
  return res.data;
};

// Get all events (admin)
export const getAdminEvents = async () => {
  const res = await api.get("/api/programs-events/events");
  return res.data;
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