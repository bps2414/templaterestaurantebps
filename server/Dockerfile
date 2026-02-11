# ---- Build Stage ----
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/

RUN npx prisma generate
RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 fluxpay

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy frontend assets from parent directory
COPY --from=builder /app/../*.html ./public/
COPY --from=builder /app/../*.css ./public/
COPY --from=builder /app/../*.js ./public/
COPY --from=builder /app/../assets ./public/assets/

# Create uploads directory
RUN mkdir -p assets/uploads && chown -R fluxpay:nodejs assets

USER fluxpay

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
