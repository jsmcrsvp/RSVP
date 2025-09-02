import axios from "axios";

const SERVER_URL = process.env.REACT_APP_BACKEND_SERVER_URL || "https://rsvp-bgol.onrender.com";

const api = axios.create({
  baseURL: SERVER_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const searchMember = async (member_id) => {
  try {
    const res = await api.post("/search_member", { member_id });
    return res.data;
  } catch (err) {
    if (err.response) throw new Error(err.response.data.message || "Server error");
    if (err.request) throw new Error("No response from server");
    throw new Error(err.message);
  }
};

export default api;