# Architecture Kooki

## Vue d'ensemble

Kooki est une plateforme de cagnottes en ligne sans commission. L'architecture suit un pattern monorepo avec separation front/back.

## Flux de paiement

### Particuliers (Separate Charges & Transfers)
1. Donateur paie via Stripe Checkout (sur compte plateforme)
2. Webhook `checkout.session.completed` -> donation COMPLETED
3. Au retrait : Transfer vers le compte Stripe Connect du beneficiaire
4. FREE : retrait disponible apres J+14 ; Payant : retrait instantane

### Associations (Direct Charges)
1. Donateur paie via Stripe Checkout (sur compte Stripe de l'asso)
2. Webhook `checkout.session.completed` -> donation COMPLETED
3. Fonds directement sur le compte de l'association
4. Si CERFA eligible + recepisse demande -> job BullMQ genere le PDF

### Contribution volontaire (Tip)
- Affichee avant validation du paiement
- Pre-cochee, modifiable, supprimable
- Calcul : ~5% du don, arrondi a 0.50 EUR, plafonne a 10 EUR
- Line item separe dans le Stripe Checkout
- Le tip reste sur le compte plateforme

## Modules backend

| Module | Responsabilite |
|--------|---------------|
| auth | Inscription, connexion, JWT |
| users | Profils utilisateurs |
| organizations | Gestion associations |
| fundraisers | CRUD cagnottes |
| plans | Plans et tarifs |
| stripe | Integration Stripe (checkout, connect, webhooks) |
| donations | Gestion des dons |
| withdrawals | Demandes de retrait |
| tax-receipts | Generation CERFA (BullMQ) |
| storage | Upload fichiers (S3) |
| email | Emails transactionnels |
| audit | Logs d'audit |
| admin | Backoffice |

## Base de donnees

Tables principales : users, organizations, fundraisers, donations, tips, withdrawals, tax_receipts, receipt_counters, audit_logs

Tous les montants sont stockes en centimes (integer).
