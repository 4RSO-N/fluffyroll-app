// API Configuration
const API_CONFIG = {
  // For development - adjust IP address as needed
  // Use your computer's IP address for testing on physical device
  // Use localhost/127.0.0.1 for testing on simulator/emulator
  BASE_URL: __DEV__ 
    ? 'http://10.1.0.7:3000/api/v1' // Development URL - using your IP address for mobile device testing
    : 'https://your-production-api.com/api/v1', // Production URL
    
  TIMEOUT: 10000,
};

export default API_CONFIG;