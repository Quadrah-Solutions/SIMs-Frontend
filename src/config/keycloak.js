import Keycloak from "keycloak-js";

// Prefer env → fallback to current host → final hard fallback
const keycloakHost =
  import.meta.env.VITE_HOST_IP ||
  window.location.hostname ||
  "192.168.8.102";

// Always match the current page protocol
const protocol = window.location.protocol.replace(":", "");

const keycloakConfig = {
  url: `${protocol}://${keycloakHost}/auth`,
  realm: import.meta.env.VITE_KEYCLOAK_REALM ?? "SIMs",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "sims_frontend",
};

console.log("🔧 Keycloak Config:", keycloakConfig);

// Create the Keycloak instance (DO NOT init here)
const keycloak = new Keycloak(keycloakConfig);

export default keycloak;

