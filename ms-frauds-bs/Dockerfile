# Multi-stage build - MS-Payments-BS (ESM + NestJS)

# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app
# Copy only package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run db:generate

# Build the application
RUN npm run build

# Prune to production dependencies only
RUN npm prune --production

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Install curl and netcat for health checks and wait-for-it
RUN apk add --no-cache curl netcat-openbsd

# Copy from builder
COPY --from=builder --chown=node:node /app/dist ./dist

COPY --from=builder --chown=node:node /app/node_modules ./node_modules

COPY --from=builder --chown=node:node /app/package*.json ./

COPY --from=builder --chown=node:node /app/prisma ./prisma

# Copiar .env
COPY --from=builder --chown=node:node /app/.env ./.env

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=5 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

USER node

# Start the application (ESM compatible)
CMD ["npm", "run", "start:prod"]