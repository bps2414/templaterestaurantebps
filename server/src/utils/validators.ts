// ============================================
// Shared Validators — Zod Schemas
// ============================================

import { z } from 'zod';

/**
 * Password validation rules (shared between register and change-password)
 */
export const passwordSchema = z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número');

/**
 * Email validation
 */
export const emailSchema = z.string().email('Email inválido');

/**
 * WhatsApp number validation (DDI + DDD + number)
 * Ex: 5511999998888 (Brazil) or any international format 12-15 digits
 */
export const whatsappSchema = z
    .string()
    .transform(val => val.replace(/\D/g, ''))
    .refine(
        val => val.length === 0 || (val.length >= 12 && val.length <= 15),
        { message: 'WhatsApp deve ter entre 12 e 15 dígitos (DDI + DDD + número). Ex: 5511999998888' }
    );
