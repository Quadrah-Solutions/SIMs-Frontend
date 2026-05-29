const config = {
  // API Base URL - prefer env, then development default, then production fallback
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.DEV ? 'http://localhost:8080/api' : '/api'),
  
  APP_NAME: 'School Health System',
  APP_VERSION: '1.0.0',
  ENV: import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development',
  
  // For debugging
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Log the config in development
if (import.meta.env.DEV) {
  console.log('🔧 App Config:', config);
}

export default config;