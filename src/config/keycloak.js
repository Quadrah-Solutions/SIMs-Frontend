import Keycloak from "keycloak-js";

// Determine the protocol based on current page
const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
const keycloakHost = 'localhost';
const keycloakPort = '8180';

// Create the Keycloak instance configuration
const keycloakConfig = {
  url: `${protocol}://${keycloakHost}:${keycloakPort}`,
  realm: import.meta.env.VITE_KEYCLOAK_REALM || "SIMs",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "sims_frontend",
};

console.log("🔧 Keycloak Config:", keycloakConfig);

// Create the Keycloak instance BUT DON'T INITIALIZE IT HERE
const keycloak = new Keycloak(keycloakConfig);

// Export the instance - initialization happens in React components
export default keycloak;