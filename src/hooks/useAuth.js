import { useState, useEffect } from "react";

/**
 * useAuth - simple hook storing user in localStorage
 * Replace with real API calls later.
 */
export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("simsUser");
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    // fake delay
    await new Promise((r) => setTimeout(r, 700));
    // simple mock credentials
    if (username === "nurse" && password === "1234") {
      const u = { name: "Nurse Joy", role: "nurse" };
      localStorage.setItem("simsUser", JSON.stringify(u));
      setUser(u);
      setLoading(false);
      return { ok: true };
    }
    if (username === "admin" && password === "admin") {
      const u = { name: "Admin", role: "admin" };
      localStorage.setItem("simsUser", JSON.stringify(u));
      setUser(u);
      setLoading(false);
      return { ok: true };
    }
    setLoading(false);
    return { ok: false, message: "Invalid credentials" };
  };

  const logout = () => {
    localStorage.removeItem("simsUser");
    setUser(null);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
