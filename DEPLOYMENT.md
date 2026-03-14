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

### 1. Local Setup (Recommended)
We provide scripts to automate the local environment setup.
```powershell
.\scripts\setup-local.ps1
```

### 2. Local Startup
Launch both services concurrently:
```powershell
.\scripts\start-local.ps1
```

### 3. Alternative: Docker Setup
If you prefer virtualization, you can still use Docker Compose:
```bash
docker-compose up -d
```

### 3b. Seed Required System Roles

After running migrations, seed the system roles (required for Coach Mode and RBAC):

```bash
cd backend
npx ts-node seed_roles.ts
```

This is idempotent — safe to run multiple times. It creates:
- `ADMIN` role
- `COACH` role (with `BYPASS_LOCKOUT` permission)
- Standard user roles

**This step is required.** Skipping it will cause `POST /api/v1/coach/initialize` to return a 500 error.

## Production Checklist
- [ ] Enable SSL (HTTPS) for both API and Frontend.
- [ ] Set `NODE_ENV=production`.
- [ ] Configure volume backups for PostgreSQL.
- [ ] Set up monitoring (Winston/Morgan logs to external service).
- [ ] Verify CORS whitelist in Backend `.env`.
