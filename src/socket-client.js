// src/socket-client.js
import { io } from "socket.io-client";

// URL of your backend server
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create socket instance
const socket = io(SOCKET_URL, {
  transports: ["websocket"], // prefer websocket
});

export default socket;
