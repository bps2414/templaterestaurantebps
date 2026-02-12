import app from './app';
import cloudinaryService from './services/cloudinaryService';
import logger from './utils/logger';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Validate Cloudinary config on startup
cloudinaryService.validateConfig();

app.listen(PORT, '0.0.0.0', () => {
    logger.info('🍽  Restaurant Template server started', {
        port: PORT,
        env: process.env.NODE_ENV || 'development',
        healthCheck: `http://localhost:${PORT}/healthz`,
        admin: `http://localhost:${PORT}/admin`,
    });
});
