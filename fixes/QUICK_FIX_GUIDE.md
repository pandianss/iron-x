# IRON-X QUICK FIX REFERENCE GUIDE

## 🚀 IMMEDIATE ACTIONS (DO THESE FIRST)

### 1. Run Critical Fixes Script
```bash
cd iron-x-main
chmod +x critical-fixes.sh
./critical-fixes.sh
```

### 2. Configure Environment Variables
```bash
# Backend
cd backend
cp .env.example .env
nano .env  # Update JWT_SECRET, DATABASE_URL, etc.

# Frontend
cd ../frontend
cp .env.example .env
nano .env  # Update VITE_API_URL if needed
```

### 3. Start Development Environment
```bash
# From iron-x-main directory
docker-compose up --build
```

---

## 📋 CRITICAL ISSUES CHEAT SHEET

### Issue #1: Axios Version
**Error:** `npm install` fails or axios behaves unexpectedly  
**Fix:** Already fixed by critical-fixes.sh  
**Verify:**
```bash
grep '"axios"' frontend/package.json backend/package.json
# Should show: "axios": "^1.7.7"
```

### Issue #2: React.FC Deprecation
**Error:** TypeScript warnings about React.FC children  
**Fix:** Run migration script
```bash
chmod +x react19-migration.sh
./react19-migration.sh
```
**Manual Review Required:** Check files with custom Props

### Issue #3: ESLint Config Error
**Error:** `Cannot find module 'eslint/config'`  
**Fix:** Already fixed by critical-fixes.sh  
**Verify:**
```bash
cd frontend && npm run lint
```

### Issue #4: TypeScript Compilation Errors
**Error:** `Unknown compiler option 'erasableSyntaxOnly'`  
**Fix:** Already fixed by critical-fixes.sh  
**Verify:**
```bash
cd frontend && npm run build
```

### Issue #8: Prisma Version Mismatch
**Error:** Prisma schema out of sync  
**Fix:** Already fixed by critical-fixes.sh  
**Verify:**
```bash
cd backend
npx prisma generate
npx prisma migrate status
```

---

## 🔧 COMMON DEVELOPMENT ISSUES

### Problem: "Cannot connect to database"
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart services
docker-compose restart postgres backend

# Check logs
docker-compose logs postgres
```

### Problem: "Port already in use"
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port in docker-compose.yml
```

### Problem: "Module not found" errors
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

cd ../backend
rm -rf node_modules package-lock.json
npm install
```

### Problem: Frontend hot reload not working
```bash
# Check if polling is enabled in vite.config.ts
# Should have:
# watch: { usePolling: true }

# Restart frontend container
docker-compose restart frontend
```

### Problem: TypeScript path aliases not working
```bash
# Ensure vite.config.ts has resolve.alias
# Ensure tsconfig.app.json has baseUrl and paths
# Restart dev server
```

---

## 🧪 TESTING CHECKLIST

### Frontend Tests
```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/pages/DashboardPage.test.tsx
```

### Backend Tests
```bash
cd backend

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm test
```

### Manual Testing
- [ ] User can register
- [ ] User can login
- [ ] Dashboard loads discipline data
- [ ] Actions can be created/edited
- [ ] Schedule displays correctly
- [ ] WebSocket real-time updates work
- [ ] Logout clears session

---

## 🔐 SECURITY CHECKLIST

### Before Deployment
- [ ] Change JWT_SECRET from default
- [ ] Update database credentials
- [ ] Configure CORS allowed origins
- [ ] Enable helmet security headers
- [ ] Set up rate limiting
- [ ] Remove debug/console logs
- [ ] Enable HTTPS
- [ ] Configure CSP headers

### JWT Secret Generation
```bash
# Generate secure JWT secret
openssl rand -base64 32

# Update in backend/.env
JWT_SECRET=<generated-value>
```

### Environment Variables Audit
```bash
# Check for hardcoded secrets
grep -r "super_secret" .
grep -r "change_me" .
grep -r "password" docker-compose.yml

# All should be using environment variables
```

---

## 📦 DEPENDENCY UPDATES

### Check for Updates
```bash
# Frontend
cd frontend
npm outdated

# Backend
cd backend
npm outdated
```

### Update Carefully (Test After Each)
```bash
# Update patch versions only (safe)
npm update

# Update minor versions (test thoroughly)
npm install package@^X.Y.0

# Update major versions (breaking changes likely)
npm install package@^X.0.0
```

### Critical Dependencies to Monitor
- `react` + `react-dom` (currently 19.2.0)
- `react-router-dom` (currently 7.13.0)
- `@prisma/client` (keep in sync with `prisma`)
- `express` (currently 5.2.1 - breaking changes)
- `axios` (keep updated for security)

---

## 🐛 DEBUGGING TIPS

### Frontend Debugging
```typescript
// Add React DevTools
// Already available in browser extension

// Debug Context values
import { useAuth } from './hooks/useAuth';

function DebugAuth() {
  const auth = useAuth();
  console.log('Auth State:', auth);
  return null;
}

// Debug API calls
import api from './lib/api-client';
api.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});
```

### Backend Debugging
```typescript
// Enable Prisma query logging
// In backend/src/db.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Debug WebSocket connections
import { Server } from 'socket.io';
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
```

### Docker Debugging
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Enter container shell
docker-compose exec backend sh
docker-compose exec frontend sh

# Check container resources
docker stats

# Rebuild specific service
docker-compose up --build backend
```

---

## 📊 PERFORMANCE OPTIMIZATION

### Frontend Bundle Analysis
```bash
cd frontend

# Build with bundle analysis
npm run build

# Analyze bundle size
npx vite-bundle-visualizer
```

### Backend Performance
```bash
# Enable Prisma query analysis
# Add to schema.prisma:
# generator client {
#   provider = "prisma-client-js"
#   previewFeatures = ["tracing"]
# }

# Monitor with pm2 in production
npm install -g pm2
pm2 start dist/index.js --name iron-x-backend
pm2 monit
```

### Database Optimization
```sql
-- Add indexes for frequently queried columns
-- Run in PostgreSQL:
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_actions_user_id ON actions(user_id);
CREATE INDEX idx_schedule_date ON scheduled_items(date);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

---

## 🚢 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Bundle size acceptable (<500KB gzipped)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security audit complete

### Production Build
```bash
# Frontend
cd frontend
npm run build
# Output in frontend/dist/

# Backend
cd backend
npm run build
# Output in backend/dist/
```

### Docker Production Images
```bash
# Build production images
docker build -t iron-x-frontend:latest -f frontend/Dockerfile frontend/
docker build -t iron-x-backend:latest -f backend/Dockerfile backend/

# Tag for registry
docker tag iron-x-frontend:latest registry.example.com/iron-x-frontend:latest
docker tag iron-x-backend:latest registry.example.com/iron-x-backend:latest

# Push to registry
docker push registry.example.com/iron-x-frontend:latest
docker push registry.example.com/iron-x-backend:latest
```

---

## 📚 ADDITIONAL RESOURCES

### Documentation
- Full Audit Report: `IRON-X_PROJECT_AUDIT.md`
- React 19 Changes: https://react.dev/blog/2024/12/05/react-19
- React Router v7: https://reactrouter.com/en/main
- Prisma Docs: https://www.prisma.io/docs
- Express 5.x: https://expressjs.com/en/guide/migrating-5.html

### Internal Documentation
```
/docs
├── ARCHITECTURE_DECISIONS.md
├── COMPLIANCE_MAPPING.md
├── DISCIPLINE_MODEL.md
├── ENFORCEMENT_RULES.md
└── TECHNICAL_RATIONALE.md
```

### Support Channels
- Project Issues: Review IRON-X_PROJECT_AUDIT.md
- React Questions: Stack Overflow + React docs
- Prisma Questions: Prisma Discord + docs
- TypeScript: TypeScript Discord + handbook

---

## 🔄 REGULAR MAINTENANCE TASKS

### Weekly
- [ ] Run `npm audit` on frontend and backend
- [ ] Check for dependency updates
- [ ] Review error logs
- [ ] Monitor bundle size
- [ ] Run full test suite

### Monthly
- [ ] Update dependencies (patch versions)
- [ ] Review and close resolved issues
- [ ] Database backup verification
- [ ] Security audit
- [ ] Performance profiling

### Quarterly
- [ ] Major dependency updates (minor versions)
- [ ] Refactor technical debt
- [ ] Update documentation
- [ ] Load testing
- [ ] Disaster recovery drill

---

**Last Updated:** February 17, 2026  
**Maintained By:** Development Team  
**Status:** Active Development

For complete details on all issues and fixes, refer to `IRON-X_PROJECT_AUDIT.md`
