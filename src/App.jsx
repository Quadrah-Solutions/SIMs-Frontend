import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
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
  return (
    <AuthProvider>
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
              
              {/* Admin-only routes */}
              <Route 
                path="management" 
                element={
                  <ProtectedRoute adminOnly>
                    <Management />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="admin/users" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminUsers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="admin/settings" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminSettings />
                  </ProtectedRoute>
                } 
              />
            </Route>

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
