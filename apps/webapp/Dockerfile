# Multi-stage build for production
FROM node:18-alpine AS base

# Install build dependencies
RUN apk add --no-cache python3 make g++ \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files from root
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY turbo.json ./
COPY pnpm-workspace.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm@10.28.0
RUN pnpm install

# Copy source code
COPY ./apps/webapp ./apps/webapp

# Build the application
RUN pnpm run build --filter=webapp

# Production stage
FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache dumb-init curl

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@10.28.0

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application and static files
COPY --from=base /app/apps/webapp/dist ./dist
COPY --from=base /app/apps/webapp/public ./public

# Set permissions
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

EXPOSE 3000

# Start with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
