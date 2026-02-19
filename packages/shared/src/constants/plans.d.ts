export interface PlanDefinition {
    code: string;
    name: string;
    ceiling: number;
    price: number;
    withdrawDelayDays: number;
    features: string[];
    popular?: boolean;
}
export declare const PERSONAL_PLANS: Record<string, PlanDefinition>;
export declare const ASSOCIATION_PLANS: Record<string, PlanDefinition>;
export declare function getPlanByCode(code: string): PlanDefinition | undefined;
