FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/message-service/package*.json ./packages/message-service/

RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci

COPY packages/shared ./packages/shared
COPY packages/message-service ./packages/message-service

RUN npm run build --workspace=packages/shared
RUN npx --workspace=packages/message-service prisma generate
RUN npm run build --workspace=packages/message-service

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/message-service ./packages/message-service

EXPOSE 4002
CMD ["node", "packages/message-service/dist/index.js"]