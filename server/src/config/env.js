/**
 * Environment & Security Configuration Validator
 */

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[FATAL SECURITY ERROR] JWT_SECRET must be set in production environments.');
    }
    return 'fallback-secret-for-development-32chars';
  }
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('[FATAL SECURITY ERROR] JWT_SECRET must be at least 32 characters in production.');
  }
  return secret;
};

const validateEnv = () => {
  if (process.env.NODE_ENV === 'production') {
    getJwtSecret();

    if (!process.env.MONGODB_URI) {
      console.warn('[SECURITY WARNING] MONGODB_URI is not set. Using default connection string.');
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('[STORAGE WARNING] Cloudinary credentials not detected. In serverless/stateless environments, local file storage will not persist.');
    }
  }
};

module.exports = {
  getJwtSecret,
  validateEnv,
};
