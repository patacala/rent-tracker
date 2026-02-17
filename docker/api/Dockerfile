# ─────────────────────────────────────────────
# Relocation Intelligence — API Dockerfile
# Stage: Development
# ─────────────────────────────────────────────

FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# ─── Dependencies Stage ──────────────────────
FROM base AS deps

# Copy workspace manifest files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY .npmrc ./

# Copy package manifests for all workspace packages
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/config/package.json ./packages/config/

# Install all dependencies (including devDeps for dev stage)
RUN pnpm install --frozen-lockfile

# ─── Development Stage ───────────────────────
FROM base AS development

WORKDIR /app

# Copy installed node_modules
COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY . .

# Generate Prisma client
RUN cd apps/api && pnpm prisma:generate

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["pnpm", "dev"]

# ─── Production Stage ────────────────────────
FROM base AS production

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN cd apps/api && pnpm prisma:generate && pnpm build

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node", "dist/main"]
