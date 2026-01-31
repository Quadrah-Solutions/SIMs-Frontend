import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiLogIn, FiShield, FiUsers } from 'react-icons/fi';

export default function Login() {
  const { authenticated, loading, login, initialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authenticated) {
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    }
  }, [authenticated, navigate, location]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8180";
      const realm = import.meta.env.VITE_KEYCLOAK_REALM || "SIMs";
      const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "sims_frontend";
      const redirectUri = encodeURIComponent(window.location.origin);
      window.location.href = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-violet-50/30">
        <div className="text-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-r from-violet-500 to-blue-500 animate-pulse mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-white"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Initializing secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-violet-50/30 p-4">
      <div className="flex w-full max-w-5xl overflow-hidden bg-white rounded-3xl shadow-2xl border border-gray-200/60 backdrop-blur-sm">
        {/* Left Section - Login Form */}
        <div className="flex flex-col items-center justify-center w-full p-8 md:p-12 lg:w-1/2">
          <div className="w-full max-w-md">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="relative">
                  <img 
                    src="/images/school-logo.png" 
                    alt="School Logo" 
                    className="h-16 w-16 object-cover rounded-2xl shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="hidden items-center justify-center h-16 w-16 bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl shadow-lg"
                    style={{display: 'none'}}
                  >
                    <span className="text-white font-bold text-sm">SCHOOL</span>
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-extrabold text-gray-900">SYTE</h1>
                  <p className="text-sm text-gray-500 mt-1">Mfantsiman Infirmary Management</p>
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mt-4">Infirmary Portal</h2>
                <p className="text-gray-600 mt-2">Secure access to student health records</p>
              </div>
            </div>

            {/* Login Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200/60 shadow-lg">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-violet-100 to-blue-100 mb-4">
                  <FiShield className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Organizational Sign In</h3>
                <p className="text-gray-600 mt-2">Use your school credentials to access the system</p>
              </div>

              <div className="space-y-6">
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="group relative w-full px-6 py-4 bg-gradient-to-r from-violet-500 to-blue-500 border border-transparent rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <FiLogIn className="w-5 h-5 text-white" />
                    <span className="text-sm font-semibold text-white">
                      {loading ? 'Initializing...' : 'Sign in to SYTE Portal'}
                    </span>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                {/* Features List */}
                <div className="space-y-4 mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                        <FiUsers className="w-4 h-4 text-violet-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Student Health Management</p>
                      <p className="text-xs text-gray-500">Access and update student medical records</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <FiShield className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Secure & Compliant</p>
                      <p className="text-xs text-gray-500">HIPAA-compliant data protection</p>
                    </div>
                  </div>
                </div>

                {!initialized && !loading && (
                  <div className="mt-6 p-4 bg-yellow-50/80 border border-yellow-200 rounded-xl backdrop-blur-sm">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-lg bg-yellow-100 flex items-center justify-center">
                          <span className="text-yellow-600 text-xs font-bold">!</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Authentication Initializing</p>
                        <p className="text-xs text-yellow-600 mt-1">
                          Click the button above to initiate secure sign-in process.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400">
                Powered by <span className="font-semibold text-violet-600">Quadrah Solutions</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">© {new Date().getFullYear()} School Information System</p>
            </div>
          </div>
        </div>

        {/* Right Section - Visual */}
        <div className="relative hidden lg:block lg:w-1/2">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-blue-500/20"></div>
          <img
            className="object-cover w-full h-full"
            src="https://scontent.facc1-1.fna.fbcdn.net/v/t39.30808-6/491789013_1102721401898736_6299064463602769695_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=127cfc&_nc_ohc=EP40HLnIhgoQ7kNvwFz71GO&_nc_oc=AdnJjLz7IX4qLlx9BksTOl56gK76-GJuZvy7ykzypFpOOAV9i780HUmoI9ZY3jmpFi4&_nc_zt=23&_nc_ht=scontent.facc1-1.fna&_nc_gid=fZdF8qyRVjuh0fAXdSrmAg&oh=00_AfvqAlDLkvf1bhUEodt-yocKVXd0jl1AsxtGgRa_j9VEaQ&oe=698393E6"
            alt="Healthcare professionals in school setting"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent flex items-end">
            <div className="p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Comprehensive Health Management</h3>
              <p className="text-gray-200">
                Streamlined access to student health information with enterprise-grade security
              </p>
              <div className="flex items-center space-x-4 mt-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-sm text-gray-200">Real-time Updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-sm text-gray-200">Secure Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}