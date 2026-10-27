const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file if available
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fixmystreet',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production_key_32_chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};

module.exports = env;
