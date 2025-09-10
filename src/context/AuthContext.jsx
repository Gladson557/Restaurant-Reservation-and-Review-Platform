import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    // persist
    if (user) localStorage.setItem("user", JSON.stringify(user)); else localStorage.removeItem("user");
    if (role) localStorage.setItem("role", role); else localStorage.removeItem("role");
    if (token) localStorage.setItem("token", token); else localStorage.removeItem("token");
  }, [user, role, token]);

  const login = ({ token: t, user: u }) => {
    setToken(t);
    setUser(u);
    setRole(u?.role);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
