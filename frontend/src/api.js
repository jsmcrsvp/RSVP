import axios from "axios";

// Point this to your backend Render URL
const api = axios.create({
  baseURL: "https://rsvp-bgol.onrender.com", 
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,  // 🔑 important if backend uses cookies / sessions
});

export default api;
