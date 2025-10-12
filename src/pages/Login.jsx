import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Login() {
  const { login, loading } = useAuth();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const loc = useLocation();

  const handle = async (e) => {
    e.preventDefault();
    setErr("");
    const res = await login(u, p);
    if (res.ok) {
      const dest = loc.state?.from?.pathname || "/";
      nav(dest, { replace: true });
    } else {
      setErr(res.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handle} className="w-80 p-6 bg-white rounded shadow">
        <h2 className="text-lg font-bold mb-4">SIMS Login</h2>
        <input
          className="w-full mb-3 p-2 border"
          placeholder="username"
          value={u}
          onChange={(e) => setU(e.target.value)}
        />
        <input
          type="password"
          className="w-full mb-3 p-2 border"
          placeholder="password"
          value={p}
          onChange={(e) => setP(e.target.value)}
        />
        {err && <div className="text-red-600 mb-2">{err}</div>}
        <button
          className="w-full bg-blue-600 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "Please wait..." : "Login"}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Try username: <b>nurse</b> / pass: <b>1234</b> or admin/admin
        </p>
      </form>
    </div>
  );
}
