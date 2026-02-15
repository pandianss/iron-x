# Base stage
FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./

# Dev stage
FROM base AS dev
RUN npm ci
COPY . .
CMD ["npm", "run", "dev", "--", "--host"]

# Build stage
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
