# Iron-X Local Start Script
Write-Host "Starting Iron-X Platform Locally..." -ForegroundColor Cyan

# Start Backend in a new window
Write-Host "Starting Backend on http://localhost:3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Start Frontend in a new window
Write-Host "Starting Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "All systems launching. Happy coding!" -ForegroundColor Cyan
