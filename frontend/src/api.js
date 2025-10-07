import axios from "axios";

const SERVER_URL =
  process.env.REACT_APP_BACKEND_SERVER_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: SERVER_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/* Member search using search_member function in server.js Commented 10/1
export const searchMember = async (payload) => {
  const res = await api.post("/search_member", payload);
  return res.data;
};
*/

// Member search using search_member function in searchMember.js
export const getMember = async (payload) => {
  const res = await api.post("/api/searchMember", payload);
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
  const res = await axios.get(`${SERVER_URL}/api/rsvp_response/${confNumber}`);
  return res.data;
};

// Verify RSVP by name and house number
export const verifyRSVPByNameHouse = async (name, houseNumber) => {
  //console.log("➡️ api.js: Sending request to /api/rsvp/search with:", { name, houseNumber });
  const res = await axios.get(`${SERVER_URL}/api/rsvp_response/search`, {
    params: { name, houseNumber },
  });
  return res.data;
};

// Update RSVP counts (adults + kids)
export const updateRSVP = async (id, payload) => {
  const res = await axios.put(`${SERVER_URL}/api/rsvp_response/update_rsvp/${id}`, payload);
  return res.data; // includes { message, updated }
};

// Dashboard
export const getDashboardStats = async () => {
  const res = await api.get("/api/dashboard/stats");
  return res.data;
};

// Update event status
export const updateEventStatus = async (progId, evId, newStatus) => {
  //console.log("➡️ Sending request to /api/updateEventStatus/ with:", { progId, evId, newStatus });
  const res = await api.put(`/api/programs/${progId}/events/${evId}/status`, {
    eventstatus: newStatus,
  });
  return res.data;
};

// ===== Events =====
// Get all events
export const getAllEvents = async () => {
  const res = await api.get("/api/add_events");
  return res.data;
};

// Add new event
export const addNewEvent = async (eventName) => {
  const res = await api.post("/api/add_events", { event_name: eventName });
  return res.data;
};

// ===== Programs =====
export const getAdminAllPrograms = async () => {
  const res = await api.get("/api/add_programs");
  return res.data;
};

export const addAdminNewProgram = async (programName) => {
  const res = await api.post("/api/add_programs", { program_name: programName });
  return res.data;
};

/* ===== Member Report using Dashboard.js =====
export const getRsvpDetails = async (programname, eventname) => {
  console.log("➡️ Sending request to /api/dashboard/rsvps with:", { programname, eventname });
  const res = await api.post("/api/dashboard/rsvps", { programname, eventname });
  return res.data;
};
*/

// ===== Member Report using Report.js =====
export const getReportStats = async () => {
  console.log("➡️ api.js: Sending request to /api/report/report-stats with:", { programname, eventname });
  const res = await api.get("/api/report/report-stats");
  return res.data;
};
export const getRsvpReports = async (programname, eventname) => {
  console.log("➡️ api.js: Sending request to /api/report/report-rsvps with:", { programname, eventname });
  const res = await api.post("/api/report/report-rsvps", { programname, eventname });
  return res.data;
};

// Get the completed event name
export const getCompletedEvents = async () => {
  const response = await fetch("/api/clearrsvp/completed-events");
  return await response.json();
};

// Clear RSVP for completed event
export const clearRsvpForEvent = async () => {
  const response = await fetch("/api/clearrsvp/clear", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return await response.json();
};



export default api;