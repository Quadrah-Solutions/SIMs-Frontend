import Keycloak from 'keycloak-js';

// Keycloak configuration - updated to match your realm and client
const keycloakConfig = {
  url: 'http://localhost:8081/',
  realm: 'SIMs',
  clientId: 'sims_frontend'
};

// Initialize Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

keycloak.init({
  onLoad: 'login-required',
  checkLoginIframe: false,
  pkceMethod: 'S256',
  scope: 'openid profile email', // Request standard OIDC scopes
}).then((authenticated) => {
  if (authenticated) {
    console.log('Authenticated');
    console.log('Access Token:', keycloak.token);
    console.log('Decoded Token:', JSON.parse(atob(keycloak.token.split('.')[1])));
    
    // Verify the token has the correct audience
    const payload = JSON.parse(atob(keycloak.token.split('.')[1]));
    if (payload.aud && payload.aud.includes('sims_backend')) {
      console.log('✅ Token has correct audience (sims_backend)');
    } else {
      console.log('❌ Token is missing sims_backend audience');
    }
  }
});

export default keycloak;


