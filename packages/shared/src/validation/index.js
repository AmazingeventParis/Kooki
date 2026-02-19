"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrganizationSchema = exports.createDonationCheckoutSchema = exports.updateFundraiserSchema = exports.createFundraiserSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    password: zod_1.z.string().min(8, 'Minimum 8 caracteres'),
    firstName: zod_1.z.string().min(2, 'Minimum 2 caracteres').optional(),
    lastName: zod_1.z.string().min(2, 'Minimum 2 caracteres').optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    password: zod_1.z.string().min(1, 'Mot de passe requis'),
});
exports.createFundraiserSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, 'Minimum 5 caracteres').max(120, 'Maximum 120 caracteres'),
    description: zod_1.z.string().min(20, 'Minimum 20 caracteres').max(5000, 'Maximum 5000 caracteres'),
    type: zod_1.z.enum(['PERSONAL', 'ASSOCIATION']),
    organizationId: zod_1.z.string().uuid().optional(),
    planCode: zod_1.z.string(),
    coverImageUrl: zod_1.z.string().url().optional(),
});
exports.updateFundraiserSchema = exports.createFundraiserSchema.partial();
exports.createDonationCheckoutSchema = zod_1.z.object({
    fundraiserId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().int().min(100, 'Minimum 1 EUR').max(100_000_00, 'Maximum 100 000 EUR'),
    donorName: zod_1.z.string().min(2).max(100),
    donorEmail: zod_1.z.string().email(),
    donorMessage: zod_1.z.string().max(500).optional(),
    isAnonymous: zod_1.z.boolean().default(false),
    wantsReceipt: zod_1.z.boolean().default(false),
    donorAddress: zod_1.z.string().max(500).optional(),
    tipAmount: zod_1.z.number().int().min(0).max(10_00).optional(),
});
exports.createOrganizationSchema = zod_1.z.object({
    legalName: zod_1.z.string().min(2).max(200),
    email: zod_1.z.string().email(),
    siret: zod_1.z.string().regex(/^\d{14}$/, 'SIRET invalide (14 chiffres)').optional(),
    address: zod_1.z.string().max(500).optional(),
});
//# sourceMappingURL=index.js.map