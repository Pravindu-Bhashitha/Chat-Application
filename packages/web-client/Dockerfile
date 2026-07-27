# packages/web-client/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/web-client/package*.json ./packages/web-client/

RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci

COPY packages/shared ./packages/shared
COPY packages/web-client ./packages/web-client

# Pass build arguments if your app uses VITE_ env variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=packages/web-client

# Production Stage with Nginx
FROM nginx:alpine AS runner

COPY packages/web-client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/packages/web-client/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]