import { useState, useEffect } from 'react';
import keycloak from '../config/keycloak';

export const useAuth = () => {
  const [authenticated, setAuthenticated] = useState(keycloak.authenticated || false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!keycloak.authenticated);

  useEffect(() => {
    console.log("🔍 useAuth useEffect running");
    console.log("🔍 keycloak object:", keycloak);
    console.log("🔍 keycloak.login:", keycloak?.login);
    
    if (keycloak.authenticated && keycloak.tokenParsed) {
      const token = keycloak.tokenParsed;
      setUser({
        username: token.preferred_username || token.email,
        email: token.email,
        roles: token.realm_access?.roles || [],
        name: token.name || token.preferred_username,
      });
      setAuthenticated(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  return {
    authenticated,
    loading,
    user,
    login: () => keycloak.login(),
    logout: () => keycloak.logout(),
    hasRole: (role) => keycloak.hasRealmRole(role),
  };
};

export default useAuth;