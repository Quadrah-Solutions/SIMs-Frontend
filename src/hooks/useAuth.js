import { useState, useEffect } from 'react';
import keycloak from '../config/keycloak';

export const useAuth = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!keycloak.tokenParsed) {
      setLoading(false);
      return;
    }

    setAuthenticated(keycloak.authenticated);
    const token = keycloak.tokenParsed;

    setUser({
      username: token.preferred_username,
      email: token.email,
      roles: token.realm_access?.roles || [],
      name: token.name,
    });

    setLoading(false);
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