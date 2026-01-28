import keycloak from "./keycloak";

let initialized = false;

export const initKeycloakOnce = async () => {
  if (initialized) {
    console.log("Keycloak already initialized, skipping");
    return keycloak;
  }

  initialized = true;

  await keycloak.init({
    onLoad: "login-required",
    pkceMethod: "S256",
    checkLoginIframe: false,
    redirectUri: window.location.origin,
  });

  console.log("Keycloak initialized (once)");
  return keycloak;
};