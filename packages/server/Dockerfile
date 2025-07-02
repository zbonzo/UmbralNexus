# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root files first
COPY package*.json ./
COPY tsconfig.base.json ./
COPY turbo.json ./

# Copy package files
COPY packages/shared/package*.json packages/shared/
COPY packages/server/package*.json packages/server/

# Install dependencies
RUN npm ci --workspace=@umbral-nexus/server

# Copy source code and configs
COPY packages/shared packages/shared
COPY packages/server packages/server

# Build the application
RUN npm run build --workspace=@umbral-nexus/shared
RUN npm run build --workspace=@umbral-nexus/server

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy package files for production install
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/packages/server/package*.json ./packages/server/
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/package*.json ./packages/shared/

# Install production dependencies only
RUN npm ci --workspace=@umbral-nexus/server --omit=dev

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/packages/server/dist ./packages/server/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/dist ./packages/shared/dist

# Switch to non-root user
USER nodejs

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "packages/server/dist/index.js"]