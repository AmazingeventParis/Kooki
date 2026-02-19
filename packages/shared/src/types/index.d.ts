export type UserRole = 'PERSONAL' | 'ORG_ADMIN' | 'ADMIN';
export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
}
export type FundraiserType = 'PERSONAL' | 'ASSOCIATION';
export type FundraiserStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'COMPLETED';
export interface Fundraiser {
    id: string;
    type: FundraiserType;
    ownerUserId: string;
    organizationId?: string;
    title: string;
    description: string;
    slug: string;
    currency: string;
    planCode: string;
    maxAmount: number;
    currentAmount: number;
    status: FundraiserStatus;
    coverImageUrl?: string;
    openingFeePaid: boolean;
    createdAt: string;
    updatedAt: string;
    owner?: User;
    donationCount?: number;
}
export type DonationStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'FAILED' | 'DISPUTED';
export interface Donation {
    id: string;
    fundraiserId: string;
    amount: number;
    currency: string;
    donorName: string;
    donorEmail: string;
    donorMessage?: string;
    isAnonymous: boolean;
    wantsReceipt: boolean;
    status: DonationStatus;
    createdAt: string;
}
export interface Organization {
    id: string;
    ownerUserId: string;
    legalName: string;
    email: string;
    siret?: string;
    address?: string;
    stripeAccountId?: string;
    isTaxEligible: boolean;
    isOnboarded: boolean;
    createdAt: string;
    updatedAt: string;
}
export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export interface Withdrawal {
    id: string;
    fundraiserId: string;
    amount: number;
    status: WithdrawalStatus;
    createdAt: string;
}
export interface TaxReceipt {
    id: string;
    organizationId: string;
    donationId: string;
    receiptNumber: string;
    pdfUrl?: string;
    status: 'PENDING' | 'GENERATED' | 'SENT' | 'CANCELLED';
    createdAt: string;
}
export interface ApiResponse<T> {
    data: T;
    message?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
