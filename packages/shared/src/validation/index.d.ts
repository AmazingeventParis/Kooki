import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
}, {
    email: string;
    password: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const createFundraiserSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    type: z.ZodEnum<["PERSONAL", "ASSOCIATION"]>;
    organizationId: z.ZodOptional<z.ZodString>;
    planCode: z.ZodString;
    coverImageUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "PERSONAL" | "ASSOCIATION";
    title: string;
    description: string;
    planCode: string;
    organizationId?: string | undefined;
    coverImageUrl?: string | undefined;
}, {
    type: "PERSONAL" | "ASSOCIATION";
    title: string;
    description: string;
    planCode: string;
    organizationId?: string | undefined;
    coverImageUrl?: string | undefined;
}>;
export declare const updateFundraiserSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["PERSONAL", "ASSOCIATION"]>>;
    organizationId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    planCode: z.ZodOptional<z.ZodString>;
    coverImageUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    type?: "PERSONAL" | "ASSOCIATION" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    organizationId?: string | undefined;
    planCode?: string | undefined;
    coverImageUrl?: string | undefined;
}, {
    type?: "PERSONAL" | "ASSOCIATION" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    organizationId?: string | undefined;
    planCode?: string | undefined;
    coverImageUrl?: string | undefined;
}>;
export declare const createDonationCheckoutSchema: z.ZodObject<{
    fundraiserId: z.ZodString;
    amount: z.ZodNumber;
    donorName: z.ZodString;
    donorEmail: z.ZodString;
    donorMessage: z.ZodOptional<z.ZodString>;
    isAnonymous: z.ZodDefault<z.ZodBoolean>;
    wantsReceipt: z.ZodDefault<z.ZodBoolean>;
    donorAddress: z.ZodOptional<z.ZodString>;
    tipAmount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    fundraiserId: string;
    amount: number;
    donorName: string;
    donorEmail: string;
    isAnonymous: boolean;
    wantsReceipt: boolean;
    donorMessage?: string | undefined;
    donorAddress?: string | undefined;
    tipAmount?: number | undefined;
}, {
    fundraiserId: string;
    amount: number;
    donorName: string;
    donorEmail: string;
    donorMessage?: string | undefined;
    isAnonymous?: boolean | undefined;
    wantsReceipt?: boolean | undefined;
    donorAddress?: string | undefined;
    tipAmount?: number | undefined;
}>;
export declare const createOrganizationSchema: z.ZodObject<{
    legalName: z.ZodString;
    email: z.ZodString;
    siret: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    legalName: string;
    siret?: string | undefined;
    address?: string | undefined;
}, {
    email: string;
    legalName: string;
    siret?: string | undefined;
    address?: string | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateFundraiserInput = z.infer<typeof createFundraiserSchema>;
export type UpdateFundraiserInput = z.infer<typeof updateFundraiserSchema>;
export type CreateDonationCheckoutInput = z.infer<typeof createDonationCheckoutSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
