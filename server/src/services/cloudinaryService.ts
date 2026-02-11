// ============================================
// Cloudinary Service — Image upload and management
// ============================================

import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import logger from '../utils/logger';
import fs from 'fs';

// Configure Cloudinary (reads from env vars)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Validate Cloudinary configuration on startup
 */
export function validateCloudinaryConfig(): boolean {
    const { cloud_name, api_key, api_secret } = cloudinary.config();

    if (!cloud_name || !api_key || !api_secret) {
        logger.error('CLOUDINARY CONFIG MISSING', {
            cloud_name: !!cloud_name,
            api_key: !!api_key,
            api_secret: !!api_secret,
        });
        return false;
    }

    logger.info('Cloudinary configured', { cloud_name });
    return true;
}

/**
 * Upload image to Cloudinary
 * @param filePath - Local file path (temporary upload)
 * @param folder - Cloudinary folder (e.g., 'dishes', 'gallery')
 * @returns Cloudinary URL or null on error
 */
export async function uploadToCloudinary(
    filePath: string,
    folder: string = 'restaurant'
): Promise<string | null> {
    try {
        const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: 'image',
            transformation: [
                { width: 1200, height: 1200, crop: 'limit' }, // Max 1200x1200
                { quality: 'auto:good' },
                { fetch_format: 'auto' }, // Auto WebP if browser supports
            ],
        });

        // Delete local temp file after successful upload
        try {
            fs.unlinkSync(filePath);
        } catch (unlinkError) {
            logger.warn('Failed to delete temp file after Cloudinary upload', { filePath });
        }

        logger.info('Image uploaded to Cloudinary', {
            public_id: result.public_id,
            url: result.secure_url,
        });

        return result.secure_url;
    } catch (error: any) {
        logger.error('Cloudinary upload failed', {
            error: error.message,
            filePath,
        });

        // Delete local temp file on error
        try {
            fs.unlinkSync(filePath);
        } catch (unlinkError) {
            // Ignore
        }

        return null;
    }
}

/**
 * Delete image from Cloudinary by URL
 * @param imageUrl - Full Cloudinary URL
 */
export async function deleteFromCloudinary(imageUrl: string): Promise<boolean> {
    try {
        // Extract public_id from URL
        // Example: https://res.cloudinary.com/demo/image/upload/v1234/folder/image.jpg
        // public_id = folder/image
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');

        if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
            logger.warn('Invalid Cloudinary URL format', { imageUrl });
            return false;
        }

        // Skip version (vXXXX) and get remaining parts
        const publicIdParts = urlParts.slice(uploadIndex + 2);
        const publicIdWithExt = publicIdParts.join('/');

        // Remove file extension
        const public_id = publicIdWithExt.replace(/\.[^/.]+$/, '');

        await cloudinary.uploader.destroy(public_id);

        logger.info('Image deleted from Cloudinary', { public_id, imageUrl });
        return true;
    } catch (error: any) {
        logger.error('Cloudinary delete failed', {
            error: error.message,
            imageUrl,
        });
        return false;
    }
}

export default {
    validateConfig: validateCloudinaryConfig,
    upload: uploadToCloudinary,
    delete: deleteFromCloudinary,
};
