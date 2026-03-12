# Iron-X Backend — Multi-stage Dockerfile

# ─── Stage 1: Development ───────────────────────────────────────────────────
FROM node:22-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ─── Stage 2: Builder ───────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ─── Stage 3: Production Runner ─────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output and Prisma schema (needed at runtime for client)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

# Run as non-root user for security
RUN addgroup -S ironx && adduser -S ironx -G ironx
USER ironx

EXPOSE 3000
CMD ["node", "dist/index.js"]
