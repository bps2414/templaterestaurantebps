// ============================================
// Upload Middleware — Multer config (hardened)
// ============================================

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { BadRequestError } from '../utils/errors';

const UPLOAD_DIR = path.join(__dirname, '../../assets/uploads');
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Magic bytes (file signatures) for image validation
const IMAGE_SIGNATURES: Record<string, number[][]> = {
    jpeg: [
        [0xFF, 0xD8, 0xFF], // JPEG
    ],
    png: [
        [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
    ],
    gif: [
        [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
        [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
    ],
    webp: [
        [0x52, 0x49, 0x46, 0x46], // RIFF (need to check WEBP at offset 8)
    ],
};

/**
 * Validate file by checking magic bytes (file signature)
 * This prevents uploading executables renamed as images
 */
export function validateImageMagicBytes(filePath: string): boolean {
    try {
        const buffer = fs.readFileSync(filePath);

        // Check each signature type
        for (const [type, signatures] of Object.entries(IMAGE_SIGNATURES)) {
            for (const signature of signatures) {
                let match = true;
                for (let i = 0; i < signature.length; i++) {
                    if (buffer[i] !== signature[i]) {
                        match = false;
                        break;
                    }
                }

                // Special case for WEBP: check "WEBP" at offset 8
                if (match && type === 'webp') {
                    const webpMarker = [0x57, 0x45, 0x42, 0x50]; // "WEBP"
                    for (let i = 0; i < webpMarker.length; i++) {
                        if (buffer[8 + i] !== webpMarker[i]) {
                            match = false;
                            break;
                        }
                    }
                }

                if (match) return true;
            }
        }

        return false; // No signature matched
    } catch (error) {
        return false;
    }
}

const storage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uuid = uuidv4();
        cb(null, `${uuid}${ext}`);
    },
});

// Allowed MIME types (strict whitelist)
const ALLOWED_MIMES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]);

// Allowed extensions (strict whitelist)
const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
    // Check MIME type against strict whitelist
    if (!ALLOWED_MIMES.has(file.mimetype)) {
        cb(new BadRequestError(`Tipo de arquivo não permitido: ${file.mimetype}`));
        return;
    }

    // Check extension against strict whitelist
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTS.has(ext)) {
        cb(new BadRequestError(`Extensão de arquivo não permitida: ${ext}`));
        return;
    }

    // Sanitize original filename (strip path components)
    file.originalname = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');

    cb(null, true);
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,    // Max 1 file per request
        fields: 10,  // Max 10 non-file fields
    },
});

export { UPLOAD_DIR };
