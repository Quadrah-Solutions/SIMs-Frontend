import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const res = await login(username, password);

    if (res.ok) {
      const dest = loc.state?.from?.pathname || "/";
      nav(dest, { replace: true });
    } else {
      setErrorMessage(res.message || "Login failed");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
              {/* Username Input */}
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
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 sm:text-sm focus:ring-gray-700 focus:border-gray-700 focus:outline-none"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              {/* Password Input (with Toggle) */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    // pr-10 ensures space for the icon
                    className="block w-full pr-10 px-4 py-3 placeholder-gray-400 border border-gray-300 rounded-md sm:text-sm focus:ring-gray-700 focus:border-gray-700 focus:outline-none"
                    placeholder="Enter your password"
                  />
                  {/* The Eye Icon Button */}
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="text-sm text-red-600 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Forgot Password Link */}
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
                  disabled={loading}
                  className={`flex justify-center w-full px-4 py-3 text-sm font-semibold text-white border border-transparent rounded-md shadow-sm transition-colors ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
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
                Try username: <b>nurse</b> / pass: <b>1234</b> or <b>admin</b>/
                <b>admin</b>
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
