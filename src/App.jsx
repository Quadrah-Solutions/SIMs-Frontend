import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import keycloak from "./config/keycloak";
import { NotificationProvider } from './components/common/NotificationProvider';

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentProfile from "./pages/StudentProfile";
import Visits from "./pages/Visits";
import NewVisit from "./pages/NewVisit";
import Medications from "./pages/Medications";
import Management from "./pages/Management";
import AdminUsers from "./pages/AdminUsers";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppShell from "./components/layout/AppShell";
import Analytics from "./pages/Analytics";

export default function App() {
  const [keycloakInitialized, setKeycloakInitialized] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
  const init = async () => {
    try {
      await initKeycloakOnce();
      setKeycloakInitialized(true);
    } catch (e) {
      console.error("Keycloak init failed", e);
      setAuthError("Authentication failed");
      setKeycloakInitialized(true);
    }
  };

  init();
}, []);

  // Show error if authentication failed
  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Authentication Error
          </h2>
          <p className="text-red-600 mb-4">{authError}</p>
          <button
            onClick={() => keycloak.login()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading spinner while Keycloak initializes
  if (!keycloakInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected area wrapped in AppShell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:id" element={<StudentProfile />} />
            <Route path="visits" element={<Visits />} />
            <Route path="visits/new" element={<NewVisit />} />
            <Route path="medications" element={<Medications />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="management" element={<Management />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/settings" element={<AdminSettings />} />
          </Route>

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}