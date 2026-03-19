// ============================================
// Test Utilities — shared helpers for all test files
// ============================================

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

export interface TestTokenOptions {
    userId?: string;
    email?: string;
    role?: 'ADMIN' | 'SUPERADMIN';
    tokenVersion?: number;
}

/**
 * Create a signed test JWT that passes requireAuth verification.
 * Pair with mockAdminUser() to satisfy the tokenVersion DB check.
 */
export function makeTestToken(options: TestTokenOptions = {}): string {
    const payload = {
        userId: options.userId ?? 'test-user-id',
        email: options.email ?? 'test@restaurante.com',
        role: options.role ?? 'ADMIN',
        tokenVersion: options.tokenVersion ?? 0,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Mock return value for prisma.adminUser.findUnique inside requireAuth.
 * tokenVersion must match the token payload.
 */
export function mockAdminUser(tokenVersion = 0) {
    return { tokenVersion };
}

export const TEST_USER_ID = 'test-user-id';
export const TEST_USER_EMAIL = 'test@restaurante.com';
