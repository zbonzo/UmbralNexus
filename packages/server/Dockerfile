# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY ../../packages/shared/package*.json ../../packages/shared/
COPY packages/server/package*.json packages/server/

# Install dependencies
RUN npm ci --workspace=@umbral-nexus/server

# Copy source code
COPY packages/shared packages/shared
COPY packages/server packages/server

# Build the application
RUN npm run build --workspace=@umbral-nexus/shared
RUN npm run build --workspace=@umbral-nexus/server

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/packages/server/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/server/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/dist ../shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/package*.json ../shared/

# Install production dependencies only
RUN npm ci --production

# Switch to non-root user
USER nodejs

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]