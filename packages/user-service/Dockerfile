FROM node:20-alpine AS builder

# Install OpenSSL and glibc compatibility layer for Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/user-service/package*.json ./packages/user-service/

RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci

COPY packages/shared ./packages/shared
COPY packages/user-service ./packages/user-service

RUN npm run build --workspace=packages/shared
RUN npx --workspace=packages/user-service prisma generate
RUN npm run build --workspace=packages/user-service

FROM node:20-alpine AS runner

# Required at runtime so Prisma engine can link SSL
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/user-service ./packages/user-service

EXPOSE 4003
CMD ["node", "packages/user-service/dist/index.js"]