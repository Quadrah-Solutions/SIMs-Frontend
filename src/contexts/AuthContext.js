// context/AuthContext.js (or wherever your AuthProvider is)
import React, { createContext, useContext, useState, useEffect } from 'react';
import keycloak from '../config/keycloak';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🚀 Initializing Keycloak...');
        
        // Initialize with proper configuration
        const auth = await keycloak.init({
          onLoad: 'check-sso',
          checkLoginIframe: false,
          pkceMethod: 'S256',
          flow: 'standard',
          enableLogging: true,
          scope: 'openid profile email',
          useNonce: true,
          useRealm: false,
          checkLoginIframeInterval: 1,
          adapter: 'default',
          responseMode: 'fragment',
          responseType: 'code'
        });
        
        console.log('✅ Keycloak initialized:', auth);
        setInitialized(true);
        setAuthenticated(auth);
        
        if (auth && keycloak.tokenParsed) {
          const token = keycloak.tokenParsed;
          console.log('🔑 Token parsed:', token);
          console.log('🎭 Realm access roles:', token.realm_access?.roles);
          console.log('🎭 Resource access roles:', token.resource_access);
          
          // Extract roles - check both realm_access and resource_access
          let roles = [];
          
          // Get realm roles
          if (token.realm_access?.roles) {
            roles = [...token.realm_access.roles];
          }
          
          // Get client-specific roles from resource_access
          if (token.resource_access) {
            const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "sims_frontend";
            if (token.resource_access[clientId]?.roles) {
              roles = [...roles, ...token.resource_access[clientId].roles];
            }
          }
          
          setUser({
            id: token.sub,
            username: token.preferred_username || token.email,
            email: token.email,
            roles: roles,
            name: token.name || token.preferred_username,
            firstName: token.given_name,
            lastName: token.family_name,
            token: keycloak.token
          });
        }
      } catch (error) {
        console.error('❌ Keycloak initialization failed:', error);
        setInitialized(true);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = () => {
    if (initialized) {
      return keycloak.login({
        redirectUri: window.location.origin + '/login'
      });
    } else {
      console.warn('Keycloak not initialized yet');
      return keycloak.init({ onLoad: 'login-required' });
    }
  };

  const logout = () => {
    if (initialized) {
      return keycloak.logout({ redirectUri: window.location.origin });
    }
  };

  const hasRole = (role) => {
    if (!initialized || !authenticated || !user) return false;
    
    // Check if user has the specified role
    return user.roles.includes(role);
  };

  const isAdmin = () => {
    return hasRole('admin') || hasRole('Admin') || hasRole('ADMIN');
  };

  const isNurse = () => {
    return hasRole('nurse') || hasRole('Nurse') || hasRole('NURSE');
  };

  const value = {
    authenticated,
    loading,
    user,
    login,
    logout,
    hasRole,
    isAdmin,
    isNurse,
    initialized,
    keycloakInstance: keycloak
  };

  return React.createElement(
    AuthContext.Provider,
    { value: value },
    children
  );
};