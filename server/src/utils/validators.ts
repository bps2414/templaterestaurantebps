import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z
        .string()
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
        .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
    orgName: z.string().min(2, 'Nome da organização deve ter pelo menos 2 caracteres').max(100).optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
});

export const refreshSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token é obrigatório').optional(),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Email inválido'),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: z
        .string()
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
        .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
});

export const newsletterSchema = z.object({
    email: z.string().email('Email inválido'),
});

export const createOrgSchema = z.object({
    name: z.string().min(2).max(100),
});

export const inviteSchema = z.object({
    email: z.string().email('Email inválido'),
    role: z.enum(['MEMBER', 'OWNER']).optional().default('MEMBER'),
});

export const checkoutSchema = z.object({
    planId: z.string().uuid('ID do plano inválido'),
    organizationId: z.string().uuid('ID da organização inválido'),
    isAnnual: z.boolean().optional().default(false),
});
