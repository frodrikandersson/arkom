/**
 * Validates required environment variables are set
 * Throws an error and exits if critical variables are missing
 */
export function validateEnvironment() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'FRONTEND_URL',
  ];

  const optionalButRecommended = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Check optional but recommended variables
  for (const envVar of optionalButRecommended) {
    if (!process.env[envVar]) {
      warnings.push(envVar);
    }
  }

  // Critical error - stop server
  if (missing.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables:');
    missing.forEach(envVar => console.error(`   - ${envVar}`));
    console.error('\nServer cannot start without these variables.');
    console.error('Please check your .env file.\n');
    process.exit(1);
  }

  // Warnings - server can run but features may be limited
  if (warnings.length > 0) {
    console.warn('⚠️  WARNING: Missing optional environment variables:');
    warnings.forEach(envVar => console.warn(`   - ${envVar}`));
    console.warn('Some features may be disabled.\n');
  }

  // Success message
  console.log('✅ Environment variables validated successfully\n');
}
