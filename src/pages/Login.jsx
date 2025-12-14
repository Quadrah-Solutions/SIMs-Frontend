import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const { authenticated, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If already authenticated, redirect to intended destination
    if (authenticated) {
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    }
  }, [authenticated, navigate, location]);

  const handleLogin = () => {
    login();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex w-full max-w-4xl overflow-hidden bg-white rounded-lg shadow-xl">
        {/* Left Section (Login Details) */}
        <div className="flex flex-col items-center justify-center w-full p-8 md:p-12 lg:w-1/2">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold text-gray-800">SIMS Login</h2>
            <p className="mt-2 text-gray-600">
              Please sign in with your organizational account.
            </p>
            
            {/* Keycloak Login Button */}
            <div className="mt-8 space-y-6">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="flex justify-center w-full px-4 py-3 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 transition-colors cursor-pointer"
              >
                Sign in to SIMS
              </button>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Secure Authentication
                  </span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-6 text-center border-t pt-4">
              <p className="text-sm text-gray-600">
                Having trouble signing in?
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Contact your system administrator
              </p>
            </div>
          </div>
        </div>

        {/* Right Section (Image) */}
        <div className="relative hidden w-1/2 lg:block">
          <img
            className="object-cover w-full h-full"
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Collaboration and security illustration"
          />
          <div className="absolute inset-0 bg-blue-900 bg-opacity-20 flex items-end">
            <div className="p-6 text-white">
              <h3 className="text-xl font-bold">School Information Management</h3>
              <p className="mt-2">Secure access to student health records</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}