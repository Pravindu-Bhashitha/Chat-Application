# Stage 1: Builder
FROM node:20-alpine AS builder

# Install OpenSSL and glibc compatibility library for Alpine
RUN apk add --no-cache openssl libc6-compat

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

# Stage 2: Production Runner
FROM node:20-alpine AS runner

# Required so Prisma's runtime binary can bind to SSL in the running container
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/auth-service ./packages/auth-service

EXPOSE 4001
# CMD ["node", "packages/auth-service/dist/index.js"]
CMD ["sh", "-c", "npx prisma db push --schema=packages/auth-service/prisma/schema.prisma --accept-data-loss && node packages/auth-service/dist/index.js"]