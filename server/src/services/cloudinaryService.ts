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

// Optional folder prefix for multi-tenant organization
const FOLDER_PREFIX = process.env.CLOUDINARY_FOLDER_PREFIX || '';

/** Allowed upload subfolders — whitelist enforced on signature generation */
export const ALLOWED_UPLOAD_SUBFOLDERS = new Set(['dishes', 'gallery', 'config', 'uploads']);

/**
 * Verify a Cloudinary URL belongs to this tenant's folder prefix.
 * Prevents cross-tenant image deletion attacks.
 *
 * URL shape: .../upload/v<version>/<folderPrefix>/<subfolder>/<file.ext>
 */
export function isTenantUrl(imageUrl: string, folderPrefix: string): boolean {
    if (!folderPrefix) return true; // Single-deployment: no isolation needed
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) return false;

    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) return false;

    // Skip 'upload' and the version segment (v<digits>)
    const publicIdParts = urlParts.slice(uploadIndex + 2);
    const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, '');

    return publicId.startsWith(`${folderPrefix}/`);
}

export interface SignedUploadParams {
    api_key: string;
    timestamp: number;
    signature: string;
    folder: string;
    cloud_name: string;
    eager: string;
}

/**
 * Generate server-side signed parameters for direct browser → Cloudinary uploads.
 * The signature embeds the tenant folder, preventing uploads outside that scope.
 * Cloudinary rejects signatures older than 1 hour (built-in expiry).
 *
 * Browser flow:
 *   1. GET /api/upload/signature?folder=dishes → receives these params
 *   2. POST directly to https://api.cloudinary.com/v1_1/{cloud_name}/image/upload
 *      including file + all returned params
 */
export function generateSignedUploadParams(subfolder: string): SignedUploadParams {
    const { cloud_name, api_key, api_secret } = cloudinary.config();

    if (!cloud_name || !api_key || !api_secret) {
        throw new Error('Cloudinary configuration missing for signature generation');
    }

    if (!ALLOWED_UPLOAD_SUBFOLDERS.has(subfolder)) {
        throw new Error(`Invalid upload subfolder: ${subfolder}`);
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = FOLDER_PREFIX ? `${FOLDER_PREFIX}/${subfolder}` : subfolder;
    const eager = 'w_1200,h_1200,c_limit/q_auto:good/f_auto';

    const signature = cloudinary.utils.api_sign_request(
        { folder, timestamp, eager },
        api_secret,
    );

    logger.info('Signed upload params generated', { folder, timestamp });

    return { api_key, timestamp, signature, folder, cloud_name, eager };
}

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
): Promise<string> {
    try {
        // Build full folder path with optional prefix
        const fullFolder = FOLDER_PREFIX ? `${FOLDER_PREFIX}/${folder}` : folder;

        const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
            folder: fullFolder,
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

        throw new Error(`Falha ao fazer upload da imagem: ${error.message}`);
    }
}

/**
 * Delete image from Cloudinary by URL
 * @param imageUrl - Full Cloudinary URL
 */
export async function deleteFromCloudinary(imageUrl: string): Promise<boolean> {
    try {
        // SECURITY: Reject deletions outside this tenant's folder prefix
        if (FOLDER_PREFIX && !isTenantUrl(imageUrl, FOLDER_PREFIX)) {
            logger.warn('SECURITY: Blocked cross-tenant image delete attempt', {
                imageUrl,
                expectedPrefix: FOLDER_PREFIX,
            });
            return false;
        }

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
    isTenantUrl,
    generateSignature: generateSignedUploadParams,
};
