# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- prisma client ----
FROM node:20-alpine AS prisma
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY prisma ./prisma
RUN npx prisma generate

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# copy node_modules + prisma client bits
COPY --from=deps /app/node_modules ./node_modules
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma
# app source
COPY . .
# security: non-root
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 4000

# Apply migrations on start (idempotent), seed once if needed, then run server
CMD sh -c "npx prisma migrate deploy && node prisma/seed.js || true && node index.js"
    