> **IMPORTANT** : Lis `project-state.md` au demarrage pour comprendre l'etat complet du projet.

# Kooki - Plateforme de cagnottes 0% commission

## Infrastructure

### Serveur OVH
- **IP** : 217.182.89.133
- **Coolify** : https://coolify.swipego.app
- **API Token Coolify** : `1|FNcssp3CipkrPNVSQyv3IboYwGsP8sjPskoBG3ux98e5a576`
- **Server UUID** : `s0cw4wsowg8wkok4wkwsko44`
- **Project UUID** : `c4gw0sos0o4cgws4404s4cwk`

### Bases de donnees Coolify
- **PostgreSQL** : UUID `vowk80sgg8080okkscscwc88`
  - URL interne : `postgres://kooki:KookiDB2026Secure@vowk80sgg8080okkscscwc88:5432/kooki`
  - Image : postgres:16-alpine
- **Redis** : UUID `q4g0ggksw8wkwws08gk8o4kw`
  - URL interne : `redis://default:KookiRedis2026Secure@q4g0ggksw8wkwws08gk8o4kw:6379/0`
  - Image : redis:7-alpine

### Applications Coolify
- **kooki-api** : UUID `f0w44gg0skgcso04o0osg8kw`, FQDN `https://kooki-api.swipego.app`, port 4000
- **kooki-web** : UUID `dw048cwkk8swkk8ckwcg4k0w`, FQDN `https://kooki.swipego.app`, port 3000
- **Deploy API** : `GET http://217.182.89.133:8000/api/v1/deploy?uuid=<app-uuid>&force=true`

### Repo GitHub
- https://github.com/AmazingeventParis/Kooki

## Stack technique
- **Front** : Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + Framer Motion
- **Back** : NestJS 11 + TypeScript
- **DB** : PostgreSQL 16 + Prisma
- **Queue** : Redis 7 + BullMQ
- **Paiements** : Stripe Connect Express (mode test)
- **Monorepo** : pnpm workspaces + Turborepo

## Structure
```
apps/api/       - Backend NestJS (port 4000)
apps/web/       - Frontend Next.js (port 3000)
packages/shared/ - Types, validation, constantes partagees
```

## Commandes
```bash
pnpm install              # Installer les dependances
pnpm dev                  # Lancer en dev (turbo)
pnpm build                # Build tout
pnpm db:migrate           # Migrations Prisma
pnpm db:push              # Push schema sans migration
pnpm db:seed              # Seed la base
pnpm db:studio            # Prisma Studio
```

## Conventions
- Montants en centimes (1000 = 10.00 EUR)
- Slugs uniques pour les cagnottes (URL publique : /c/mon-slug)
- Plans definis dans packages/shared/src/constants/plans.ts
- API REST prefixee /api/ (ex: /api/auth/login)
- Webhooks Stripe sur /api/webhooks/stripe

## Stripe (mode test)
- Separate Charges & Transfers pour les particuliers
- Direct Charges pour les associations
- Contribution volontaire (tip) = line item separe, max 10 EUR
- KYC via Stripe Connect Express avant payout
