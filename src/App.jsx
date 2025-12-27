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

  useEffect(() => {
    const initializeKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'login-required', // Changed to 'login-required' to force login
          checkLoginIframe: false, // Disable iframe check to avoid CORS issues
          pkceMethod: 'S256',
          scope: 'openid' // Add scope explicitly
        });

        console.log('Keycloak initialized, authenticated:', authenticated);
        setKeycloakInitialized(true);
      } catch (error) {
        console.error('Keycloak initialization failed', error);
        setKeycloakInitialized(true);
      }
    };

    initializeKeycloak();
  }, []);

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