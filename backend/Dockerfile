# Base stage
FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Dev stage
FROM base AS dev
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts && npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
