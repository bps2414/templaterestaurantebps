# ---- Build Stage ----
FROM node:18-alpine AS builder

WORKDIR /app/server

# Copy server dependencies
COPY server/package.json server/package-lock.json* ./
RUN npm ci --ignore-scripts

COPY server/tsconfig.json ./
COPY server/prisma ./prisma/
COPY server/src ./src/

RUN npx prisma generate
RUN npm run build

# Copy frontend assets
COPY public /app/public/

# ---- Production Stage ----
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy built server
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma

# Copy frontend
COPY --from=builder /app/public ./public

# Create uploads directory
RUN mkdir -p server/assets/uploads && chown -R appuser:nodejs server/assets

USER appuser

EXPOSE 3000

WORKDIR /app/server

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
