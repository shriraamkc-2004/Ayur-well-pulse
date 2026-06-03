#!/bin/bash
# Ayur-Well Pulse - Quick Start Script for Mac/Linux

echo "========================================"
echo " Ayur-Well Pulse - Starting Application"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/4] Checking Node.js version..."
node --version
echo ""

# Setup Backend
echo "[2/4] Setting up backend server..."
cd server

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found!"
    echo "Please copy .env.example to .env and configure it."
    echo ""
    echo "Generating secure secrets for you..."
    echo ""
    
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex').substring(0,32))")
    COOKIE_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/ayurwell
PORT=5000
NODE_ENV=development
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
ALLOWED_ORIGINS=http://localhost:8080
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=20
ENCRYPTION_KEY=$ENCRYPTION_KEY
COOKIE_SECRET=$COOKIE_SECRET
EOF
    
    echo ".env file created with secure secrets!"
    echo ""
fi

echo "Starting backend server on port 5000..."
npm run dev &
BACKEND_PID=$!
cd ..
echo ""

# Setup Frontend
echo "[3/4] Setting up frontend..."
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Starting frontend on port 8080..."
npm run dev &
FRONTEND_PID=$!
echo ""

# Wait for servers to start
echo "[4/4] Waiting for servers to start..."
sleep 5

echo ""
echo "========================================"
echo " Application Started Successfully!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:8080"
echo "Health:   http://localhost:5000/health"
echo ""
echo "Opening application in browser..."
sleep 2

# Open in browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:8080
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:8080
fi

echo ""
echo "To stop the application, press Ctrl+C"
echo ""

# Wait for user to stop
wait
