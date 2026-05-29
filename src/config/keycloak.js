import Keycloak from "keycloak-js";

// Use the FULL URL from env instead of constructing it
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8081",
  realm: import.meta.env.VITE_KEYCLOAK_REALM ?? "SIMs",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "sims_frontend",
};

console.log("🔧 Keycloak Config:", keycloakConfig);

// Create the Keycloak instance (DO NOT init here)
const keycloak = new Keycloak(keycloakConfig);

export default keycloak;