// Environment variables utility with validation
export const env = {
  YOUTUBE_API_KEY: import.meta.env.VITE_YOUTUBE_API_KEY,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Validate required environment variables
export const validateEnv = () => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  if (!env.YOUTUBE_API_KEY) {
    warnings.push('VITE_YOUTUBE_API_KEY is not set. YouTube videos will use mock data.');
  }
  
  // Log warnings in development
  if (warnings.length > 0 && env.isDevelopment) {
    console.warn('🟡 Environment warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  // Log errors (if any)
  if (errors.length > 0) {
    console.error('🔴 Environment errors:');
    errors.forEach(error => console.error(`  - ${error}`));
  }
  
  return { warnings, errors };
};

// Initialize environment validation
validateEnv();

// Export validation results for use in components
export const envStatus = validateEnv();