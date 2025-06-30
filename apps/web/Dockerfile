# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/shared/package*.json packages/shared/
COPY apps/web/package*.json apps/web/

# Install dependencies
RUN npm ci

# Copy source code
COPY packages/shared packages/shared
COPY apps/web apps/web

# Build the application
ARG VITE_API_URL
ARG VITE_WS_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build --workspace=@umbral-nexus/shared
RUN npm run build --workspace=@umbral-nexus/web

# Production stage - just copy static files
FROM scratch AS export
COPY --from=builder /app/apps/web/dist /