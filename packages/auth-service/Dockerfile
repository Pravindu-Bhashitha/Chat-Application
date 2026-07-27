FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/auth-service/package*.json ./packages/auth-service/

# Install all dependencies across the workspace
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/auth-service ./packages/auth-service

# Build shared package first
RUN npm run build --workspace=packages/shared

# Generate Prisma Client & compile TypeScript
RUN npx --workspace=packages/auth-service prisma generate
RUN npm run build --workspace=packages/auth-service

# Production Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/auth-service ./packages/auth-service

EXPOSE 4001
CMD ["node", "packages/auth-service/dist/index.js"]