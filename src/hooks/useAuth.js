import { useState, useEffect } from 'react';
import keycloak from '../config/keycloak';

export const useAuth = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const updateAuthState = () => {
      setAuthenticated(keycloak.authenticated);
      
      if (keycloak.authenticated && keycloak.tokenParsed) {
        const token = keycloak.tokenParsed;
        setUser({
          username: token.preferred_username,
          email: token.email,
          firstName: token.given_name,
          lastName: token.family_name,
          roles: token.realm_access?.roles || [],
          fullName: token.name,
          // Add this line to have both fullName and name available
          name: token.name || `${token.given_name} ${token.family_name}`.trim()
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    // Initial state update
    updateAuthState();

    // Listen for auth events
    keycloak.onAuthSuccess = () => {
      console.log('Auth success');
      updateAuthState();
    };

    keycloak.onAuthError = (error) => {
      console.error('Auth error:', error);
      setLoading(false);
    };

    keycloak.onAuthRefreshSuccess = () => {
      console.log('Token refresh success');
      updateAuthState();
    };

    keycloak.onAuthRefreshError = () => {
      console.error('Token refresh failed');
      setAuthenticated(false);
      setUser(null);
      setLoading(false);
    };

    keycloak.onAuthLogout = () => {
      console.log('User logged out');
      setAuthenticated(false);
      setUser(null);
      setLoading(false);
    };

    keycloak.onTokenExpired = () => {
      console.log('Token expired');
      keycloak.updateToken(30).then((refreshed) => {
        if (refreshed) {
          console.log('Token refreshed');
        } else {
          console.log('Token refresh failed');
        }
      }).catch(() => {
        console.log('Failed to refresh token');
      });
    };

  }, []);

  const login = () => {
    return keycloak.login();
  };

  const logout = () => {
    return keycloak.logout();
  };

  const register = () => {
    return keycloak.register();
  };

  const hasRole = (role) => {
    return keycloak.hasRealmRole(role);
  };

  return {
    authenticated,
    loading,
    user,
    login,
    logout,
    register,
    hasRole,
    keycloak
  };
};

export default useAuth;