# IRON-X Deployment Guide

This guide provides instructions for deploying the IRON-X platform to production environments.

## Architecture Overview
IRON-X consists of:
- **Backend**: Node.js (Express + Prisma)
- **Frontend**: Vite (React + TypeScript)
- **Database**: PostgreSQL
- **Cache**: Redis (for rate limiting and job queues)

## Environment Variables

### Backend
Create a `.env` file in `backend/` with:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ironx"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-key"
FRONTEND_URL="https://app.iron-x.com"
API_URL="https://api.iron-x.com"
PORT=3000
STRIPE_SECRET_KEY="sk_test_..."
EXPORT_SECRET="your-export-secret"
```

### Frontend
Create a `.env` file in `frontend/` with:
```env
VITE_API_URL="https://api.iron-x.com/api/v1"
```

## Deployment Steps

### 1. Database Setup
Ensure PostgreSQL is running and accessible.
```bash
cd backend
npx prisma migrate deploy
```

### 2. Backend Deployment
We recommend using Docker or a Node.js-ready platform.
```bash
cd backend
npm install
npm run build
npm start
```

### 3. Frontend Deployment
The frontend can be deployed as a static site (Vercel, Netlify, S3).
```bash
cd frontend
npm install
npm run build
# Deploy 'dist' folder
```

## Production Checklist
- [ ] Enable SSL (HTTPS) for both API and Frontend.
- [ ] Set `NODE_ENV=production`.
- [ ] Configure volume backups for PostgreSQL.
- [ ] Set up monitoring (Winston/Morgan logs to external service).
- [ ] Verify CORS whitelist in Backend `.env`.
