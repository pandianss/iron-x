#!/bin/bash
# IRON-X CRITICAL FIXES AUTOMATION SCRIPT
# Run this script from the iron-x-main directory
# Usage: bash critical-fixes.sh

set -e  # Exit on error

echo "🔧 IRON-X CRITICAL FIXES - STARTING..."
echo "========================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: Must run from iron-x-main directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Phase 1: Fixing package.json versions${NC}"
echo "-------------------------------------------"

# Fix axios version in frontend
echo "Fixing frontend axios version..."
sed -i 's/"axios": "\^1\.13\.5"/"axios": "^1.7.7"/' frontend/package.json

# Fix axios version in backend
echo "Fixing backend axios version..."
sed -i 's/"axios": "\^1\.13\.5"/"axios": "^1.7.7"/' backend/package.json

# Fix Prisma versions in backend (exact versions, no caret)
echo "Fixing Prisma versions..."
sed -i 's/"@prisma\/client": "\^6\.3\.1"/"@prisma\/client": "6.3.1"/' backend/package.json
sed -i 's/"prisma": "\^6\.3\.1"/"prisma": "6.3.1"/' backend/package.json

# Fix PostCSS version
echo "Fixing PostCSS version..."
sed -i 's/"postcss": "\^8\.5\.6"/"postcss": "^8.4.47"/' frontend/package.json

echo -e "${GREEN}✅ Package versions updated${NC}"
echo ""

echo -e "${YELLOW}📋 Phase 2: Fixing TypeScript configurations${NC}"
echo "----------------------------------------------"

# Backup original tsconfig.app.json
cp frontend/tsconfig.app.json frontend/tsconfig.app.json.backup

# Fix TypeScript config
cat > frontend/tsconfig.app.json << 'EOF'
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
EOF

echo -e "${GREEN}✅ TypeScript config fixed${NC}"
echo ""

echo -e "${YELLOW}📋 Phase 3: Fixing ESLint configuration${NC}"
echo "--------------------------------------------"

# Backup original eslint config
cp frontend/eslint.config.js frontend/eslint.config.js.backup

# Fix ESLint flat config
cat > frontend/eslint.config.js << 'EOF'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.reduce((acc, config) => ({ ...acc, ...config.rules }), {}),
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
EOF

echo -e "${GREEN}✅ ESLint config fixed${NC}"
echo ""

echo -e "${YELLOW}📋 Phase 4: Creating missing test setup file${NC}"
echo "---------------------------------------------------"

cat > frontend/src/setupTests.ts << 'EOF'
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;
EOF

echo -e "${GREEN}✅ Test setup file created${NC}"
echo ""

echo -e "${YELLOW}📋 Phase 5: Fixing Docker Compose configuration${NC}"
echo "---------------------------------------------------"

# Backup original docker-compose.yml
cp docker-compose.yml docker-compose.yml.backup

# Remove deprecated version key
sed -i '/^version:/d' docker-compose.yml

echo -e "${GREEN}✅ Docker Compose updated${NC}"
echo ""

echo -e "${YELLOW}📋 Phase 6: Creating nodemon configuration${NC}"
echo "----------------------------------------------"

cat > backend/nodemon.json << 'EOF'
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.test.ts", "node_modules"],
  "exec": "ts-node src/index.ts",
  "env": {
    "NODE_ENV": "development"
  }
}
EOF

echo -e "${GREEN}✅ Nodemon config created${NC}"
echo ""

echo -e "${YELLOW}📋 Phase 7: Installing dependencies${NC}"
echo "-----------------------------------------"

# Frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
cd ..

echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# Backend dependencies
echo "Installing backend dependencies..."
cd backend
rm -rf node_modules package-lock.json
npm install
npx prisma generate
cd ..

echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

echo -e "${YELLOW}📋 Phase 8: Creating security configuration files${NC}"
echo "-----------------------------------------------------"

# Create .env.example for backend
cat > backend/.env.example << 'EOF'
# Database
DATABASE_URL=postgresql://iron_user:iron_password@localhost:5432/iron_db?schema=public

# Server
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# CORS
FRONTEND_URL=http://localhost:5173
EOF

# Create .env.example for frontend
cat > frontend/.env.example << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_APP_BASENAME=/

# Environment
VITE_NODE_ENV=development
EOF

echo -e "${GREEN}✅ Environment templates created${NC}"
echo ""

echo -e "${YELLOW}📋 Phase 9: Verifying fixes${NC}"
echo "--------------------------------"

# Check if critical files exist
echo "Checking file integrity..."

FILES_TO_CHECK=(
    "frontend/package.json"
    "backend/package.json"
    "frontend/tsconfig.app.json"
    "frontend/eslint.config.js"
    "frontend/src/setupTests.ts"
    "backend/nodemon.json"
    "backend/.env.example"
    "frontend/.env.example"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file - MISSING!"
    fi
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ CRITICAL FIXES COMPLETED${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}📌 Next Steps:${NC}"
echo "1. Review backup files created (.backup extension)"
echo "2. Copy .env.example to .env and configure values:"
echo "   cd backend && cp .env.example .env"
echo "   cd frontend && cp .env.example .env"
echo "3. Test the application:"
echo "   docker-compose up --build"
echo "4. Run tests:"
echo "   cd frontend && npm test"
echo "   cd backend && npm test"
echo "5. Review the full audit report: IRON-X_PROJECT_AUDIT.md"
echo ""
echo -e "${YELLOW}⚠️  Manual Fixes Still Required:${NC}"
echo "- React 19 FC migration (51 files) - see audit report ISSUE #2"
echo "- Express 5.x compatibility checks - see audit report ISSUE #9"
echo "- Security hardening (CORS, JWT, localStorage) - see audit report"
echo "- React Router v7 compatibility testing - see audit report ISSUE #6"
echo ""
echo -e "${GREEN}Script completed successfully!${NC}"
