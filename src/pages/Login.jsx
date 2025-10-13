import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Login() {
  // Renamed state variables for clarity
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { login, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors
    
    // Use the renamed state variables in the login call
    const res = await login(username, password);

    if (res.ok) {
      // Navigate to the intended destination or root
      const dest = loc.state?.from?.pathname || "/";
      nav(dest, { replace: true });
    } else {
      // Set the error message, providing a fallback
      setErrorMessage(res.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex w-full max-w-4xl overflow-hidden bg-white rounded-lg shadow-xl">
        {/* Left Section (Login Details) */}
        <div className="flex flex-col items-center justify-center w-full p-8 md:p-12 lg:w-1/2">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold text-gray-800">SIMS Login</h2>
            <p className="mt-2 text-gray-600">
              Please enter your details to sign in.
            </p>
            <form onSubmit={handleLoginSubmit} className="mt-8 space-y-6">
              
              {/* Username/Email Input */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text" // Changed from email to text for generic username/ID
                    autoComplete="username"
                    required
                    value={username}
                    // Use the renamed state setter
                    onChange={(e) => setUsername(e.target.value)}
                    // Updated focus classes to a deep gray (gray-700)
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 sm:text-sm focus:ring-gray-700 focus:border-gray-700 focus:outline-none"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    // Use the renamed state setter
                    onChange={(e) => setPassword(e.target.value)}
                    // Updated focus classes to a deep gray (gray-700)
                    className="block w-full px-4 py-3 placeholder-gray-400 border border-gray-300 rounded-md sm:text-sm focus:ring-gray-700 focus:border-gray-700 focus:outline-none"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="text-sm text-red-600 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Forgot Password Link (Retained for style consistency) */}
              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-gray-600 hover:text-gray-800"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading} // Disable button when loading
                  className={`flex justify-center w-full px-4 py-3 text-sm font-semibold text-white border border-transparent rounded-md shadow-sm transition-colors ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed" // Loading/Disabled state
                      : "bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
                  }`}
                >
                  {loading ? "Please wait..." : "Login"}
                </button>
              </div>
            </form>

            {/* Credentials Hint / Footer */}
            <div className="mt-6 text-center border-t pt-4">
              <p className="text-xs text-gray-500 mt-2">
                Try username: <b>nurse</b> / pass: <b>1234</b> or <b>admin</b>/<b>admin</b>
              </p>
              <p className="mt-4 text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href="#"
                  className="font-semibold text-gray-700 hover:text-gray-900"
                >
                  Contact Admin
                </a>
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
        </div>
      </div>
    </div>
  );
}