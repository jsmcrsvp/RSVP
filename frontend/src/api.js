import axios from "axios";

const SERVER_URL = process.env.REACT_APP_BACKEND_SERVER_URL || "https://rsvp-bgol.onrender.com";

const api = axios.create({
  baseURL: SERVER_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const searchMember = async (payload) => {
    console.log("✅ API Member Search:", payload);
  const res = await api.post("/search_member", payload);
  return res.data;
};

export default api;