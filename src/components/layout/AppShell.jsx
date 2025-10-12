import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

function Sidebar({ current }) {
  const navigate = useNavigate();
  const items = [
    ["/", "Dashboard"],
    ["/students", "Students"],
    ["/visits", "Visits"],
    ["/visits/new", "New Visit"],
    ["/medications", "Medications"],
    ["/inventory", "Inventory"],
    ["/reports", "Reports"],
  ];
  return (
    <aside className="w-56 bg-gray-800 text-white p-4 fixed inset-y-0 left-0">
      <div className="font-bold text-lg mb-4">ClinicConnect</div>
      <nav className="space-y-2">
        {items.map(([path, label]) => (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className={`block w-full text-left px-3 py-2 rounded ${
              current === path ? "bg-emerald-600" : "hover:bg-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
    </nav>
    </aside>
  );
}

function Topbar() {
  const { user, logout } = useAuth();
  return (
    <header className="h-16 bg-white shadow flex items-center justify-end px-6 ml-56">
      <div className="mr-4 text-sm text-gray-700">{user?.name}</div>
      <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">
        Logout
      </button>
    </header>
  );
}

export default function AppShell() {
  const location = useLocation();
  return (
    <div>
      <Sidebar current={location.pathname} />
      <div className="ml-56">
        <Topbar />
        <main className="p-6 mt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
