# =============================================================================
# Stage 1: Base image
# =============================================================================
FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# =============================================================================
# Stage 2: Builder
# =============================================================================
FROM base AS builder

# Copy the entire monorepo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/ packages/
COPY apps/api/ apps/api/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm --filter @kooki/api exec prisma generate

# Build shared package first, then api
RUN pnpm --filter @kooki/shared run build
RUN pnpm --filter @kooki/api run build

# Prune dev dependencies
RUN pnpm prune --prod

# =============================================================================
# Stage 3: Runner (production)
# =============================================================================
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Add non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

# Copy built output and production node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# Set working directory to the api app
WORKDIR /app/apps/api

EXPOSE 4000

ENV NODE_ENV=production
ENV API_PORT=4000

# Push schema to DB then start
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/main.js"]
