import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caracteres'),
  firstName: z.string().min(2, 'Minimum 2 caracteres').optional(),
  lastName: z.string().min(2, 'Minimum 2 caracteres').optional(),
  role: z.enum(['PERSONAL', 'ORG_ADMIN']).default('PERSONAL'),
  organizationName: z.string().min(2, 'Minimum 2 caracteres').optional(),
  organizationSiret: z.string().optional(),
  organizationRna: z.string().optional(),
  organizationAddress: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const createFundraiserSchema = z.object({
  title: z.string().min(5, 'Minimum 5 caracteres').max(120, 'Maximum 120 caracteres'),
  description: z.string().min(20, 'Minimum 20 caracteres').max(5000, 'Maximum 5000 caracteres'),
  type: z.enum(['PERSONAL', 'ASSOCIATION']),
  organizationId: z.string().uuid().optional(),
  planCode: z.string(),
  coverImageUrl: z.string().url().optional(),
});

export const updateFundraiserSchema = createFundraiserSchema.partial();

export const createDonationCheckoutSchema = z.object({
  fundraiserId: z.string().uuid(),
  amount: z.number().int().min(100, 'Minimum 1 EUR').max(100_000_00, 'Maximum 100 000 EUR'),
  donorName: z.string().min(2).max(100),
  donorEmail: z.string().email(),
  donorMessage: z.string().max(500).optional(),
  isAnonymous: z.boolean().default(false),
  wantsReceipt: z.boolean().default(false),
  donorAddress: z.string().max(500).optional(),
  tipAmount: z.number().int().min(0).max(10_00).optional(),
});

export const createOrganizationSchema = z.object({
  legalName: z.string().min(2).max(200),
  email: z.string().email(),
  siret: z.string().regex(/^\d{14}$/, 'SIRET invalide (14 chiffres)').optional(),
  rnaNumber: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateFundraiserInput = z.infer<typeof createFundraiserSchema>;
export type UpdateFundraiserInput = z.infer<typeof updateFundraiserSchema>;
export type CreateDonationCheckoutInput = z.infer<typeof createDonationCheckoutSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
