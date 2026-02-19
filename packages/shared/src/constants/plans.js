"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASSOCIATION_PLANS = exports.PERSONAL_PLANS = void 0;
exports.getPlanByCode = getPlanByCode;
exports.PERSONAL_PLANS = {
    FREE: {
        code: 'PERSONAL_FREE',
        name: 'Gratuit',
        ceiling: 500_00,
        price: 0,
        withdrawDelayDays: 14,
        features: [
            'Cagnotte jusqu\'a 500 EUR',
            'URL publique instantanee',
            'Partage sur les reseaux',
            'Retrait sous 14 jours',
        ],
    },
    STANDARD: {
        code: 'PERSONAL_STANDARD',
        name: 'Standard',
        ceiling: 10_000_00,
        price: 9_00,
        withdrawDelayDays: 0,
        features: [
            'Cagnotte jusqu\'a 10 000 EUR',
            'Retrait instantane',
            'Personnalisation avancee',
            'Statistiques detaillees',
        ],
        popular: true,
    },
    PLUS: {
        code: 'PERSONAL_PLUS',
        name: 'Plus',
        ceiling: 25_000_00,
        price: 19_00,
        withdrawDelayDays: 0,
        features: [
            'Cagnotte jusqu\'a 25 000 EUR',
            'Retrait instantane',
            'Page projet enrichie',
            'Support prioritaire',
        ],
    },
    PREMIUM: {
        code: 'PERSONAL_PREMIUM',
        name: 'Premium',
        ceiling: Infinity,
        price: 39_00,
        withdrawDelayDays: 0,
        features: [
            'Aucune limite de montant',
            'Retrait instantane',
            'Page projet premium',
            'Support dedie',
            'Analytics avancees',
        ],
    },
};
exports.ASSOCIATION_PLANS = {
    FREE: {
        code: 'ASSO_FREE',
        name: 'Gratuit',
        ceiling: 2_000_00,
        price: 0,
        withdrawDelayDays: 0,
        features: [
            'Collecte jusqu\'a 2 000 EUR',
            'CERFA automatique si eligible',
            'Page de collecte publique',
        ],
    },
    STARTER: {
        code: 'ASSO_STARTER',
        name: 'Starter',
        ceiling: 50_000_00,
        price: 79_00,
        withdrawDelayDays: 0,
        features: [
            'Collecte jusqu\'a 50 000 EUR',
            'CERFA automatique',
            'Personnalisation avancee',
            'Statistiques donateurs',
        ],
        popular: true,
    },
    PRO: {
        code: 'ASSO_PRO',
        name: 'Pro',
        ceiling: 250_000_00,
        price: 249_00,
        withdrawDelayDays: 0,
        features: [
            'Collecte jusqu\'a 250 000 EUR',
            'CERFA automatique',
            'Export CSV donateurs',
            'Mini CRM integre',
            'Support prioritaire',
        ],
    },
    IMPACT: {
        code: 'ASSO_IMPACT',
        name: 'Impact',
        ceiling: 1_000_000_00,
        price: 599_00,
        withdrawDelayDays: 0,
        features: [
            'Collecte jusqu\'a 1 000 000 EUR',
            'Toutes les fonctionnalites Pro',
            'Analytics conversion',
            'Relances automatisees',
            'Support dedie',
        ],
    },
    ENTERPRISE: {
        code: 'ASSO_ENTERPRISE',
        name: 'Enterprise',
        ceiling: Infinity,
        price: -1,
        withdrawDelayDays: 0,
        features: [
            'Volume illimite',
            'Accompagnement sur mesure',
            'API dediee',
            'SLA garanti',
        ],
    },
};
function getPlanByCode(code) {
    const all = { ...exports.PERSONAL_PLANS, ...exports.ASSOCIATION_PLANS };
    return Object.values(all).find((p) => p.code === code);
}
//# sourceMappingURL=plans.js.map