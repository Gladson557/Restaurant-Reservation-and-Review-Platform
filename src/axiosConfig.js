// src/axiosConfig.js
import axios from "axios";

/**
 * Resolve API base URL with fallback order:
 * 1) Vite build-time env (import.meta.env.VITE_API_URL)
 * 2) runtime override window.__API_URL (set in index.html)
 * 3) localhost for dev
 */
const API_URL = (typeof import !== "undefined" && import.meta && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : (window.__API_URL || "http://localhost:5000");

// Set axios defaults so all existing axios(...) calls without absolute URL will use this
axios.defaults.baseURL = `${API_URL}/api`;

// Optional defaults
axios.defaults.headers.common["Content-Type"] = "application/json";
// axios.defaults.withCredentials = true; // enable if you're using cookies

export default axios;
