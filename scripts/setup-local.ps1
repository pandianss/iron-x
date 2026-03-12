# Iron-X Local Setup Script
Write-Host "Checking local dependencies..." -ForegroundColor Cyan

# 1. Check for Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed. Please install it from https://nodejs.org/"
    exit 1
}

# 2. Install dependencies
Write-Host "Installing Backend dependencies..." -ForegroundColor Green
cd backend
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Installing Frontend dependencies..." -ForegroundColor Green
cd ../frontend
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# 3. Database Migration
Write-Host "Running Prisma migrations..." -ForegroundColor Green
cd ../backend
npx prisma migrate dev --name init_local
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Local setup complete!" -ForegroundColor Cyan
