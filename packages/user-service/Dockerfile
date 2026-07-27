FROM node:20-alpine AS builder

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
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/user-service ./packages/user-service

EXPOSE 4000
CMD ["node", "packages/user-service/dist/index.js"]