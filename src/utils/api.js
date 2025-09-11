// src/utils/api.js
import axios from "axios";

/**
 * Lazy axios instance.
 * Exports a proxy that behaves like an axios instance (callable and with methods like .get/.post),
 * but does NOT create the real axios instance until the first time it is used.
 *
 * This prevents "Cannot access 'api' before initialization" errors caused by circular imports
 * or temporal-dead-zone (TDZ) problems.
 */

function resolveApiUrl() {
  // Try Vite build-time env (safe in a module; wrapped in try/catch)
  try {
    if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
  } catch (e) {
    // import.meta might not be accessible in some contexts; ignore
  }

  if (typeof window !== "undefined" && window.__API_URL) {
    return window.__API_URL;
  }

  return "http://localhost:5000";
}




let _axiosInstance = null;

function createAxiosInstance() {
  const API_URL = resolveApiUrl();
  const inst = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  });

  inst.interceptors.request.use((config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      // ignore in non-browser envs
    }
    return config;
  }, (err) => Promise.reject(err));

  return inst;
}

function ensureInstance() {
  if (!_axiosInstance) _axiosInstance = createAxiosInstance();
  return _axiosInstance;
}

// Create a callable function that forwards calls to the axios instance
function callableAxios(...args) {
  const inst = ensureInstance();
  return inst(...args);
}

// Use a Proxy so property access (api.get, api.post, etc.) forwards to the real axios instance.
// Also ensure the function is callable (axios is a function).
const api = new Proxy(callableAxios, {
  get(target, prop) {
    // support debugging like console.log(api) without creating instance? We still create instance.
    const inst = ensureInstance();
    const value = inst[prop];
    // If it's a function, bind it to the instance so `get` works when extracted.
    if (typeof value === "function") return value.bind(inst);
    return value;
  },
  apply(target, thisArg, args) {
    const inst = ensureInstance();
    return inst.apply(thisArg, args);
  },
  // Optional: reflect has etc.
});



export default api;
