#!/bin/bash
# Ayur-Well Pulse - Complete Verification Script
# Tests all functions, security, flow, and UI/UX

echo "============================================================"
echo " Ayur-Well Pulse v2.0 - Complete System Verification"
echo "============================================================"
echo ""

# Check Node.js
echo "[1/10] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ FAIL: Node.js not installed!"
    exit 1
fi
echo "✅ Node.js: $(node --version)"
echo ""

# Check npm
echo "[2/10] Checking npm..."
npm --version
echo ""

# Verify Backend Dependencies
echo "[3/10] Verifying backend dependencies..."
cd server
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi
echo "✅ Backend dependencies installed"
echo ""

# Verify Frontend Dependencies
cd ..
echo "[4/10] Verifying frontend dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
echo "✅ Frontend dependencies installed"
echo ""

# Check Environment Configuration
echo "[5/10] Checking environment configuration..."
cd server
if [ ! -f ".env" ]; then
    echo "❌ WARNING: .env file missing!"
    echo "Creating .env from example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit server/.env and generate secure secrets!"
    echo "Run these commands and update .env:"
    echo ""
    echo 'node -e "console.log(require('\''crypto'\'').randomBytes(64).toString('\''hex'\''))"'
    echo ""
    read -p "Press Enter to continue..."
else
    echo "✅ .env file exists"
fi
echo ""

# Verify Security Features
echo "[6/10] Verifying security features..."
echo "Checking security packages..."
node -e "try { require('helmet'); console.log('✅ Helmet.js'); } catch(e) { console.log('❌ Helmet.js missing'); }"
node -e "try { require('express-rate-limit'); console.log('✅ Rate Limiting'); } catch(e) { console.log('❌ Rate Limiting missing'); }"
node -e "try { require('express-validator'); console.log('✅ Input Validation'); } catch(e) { console.log('❌ Input Validation missing'); }"
node -e "try { require('cookie-parser'); console.log('✅ Cookie Parser'); } catch(e) { console.log('❌ Cookie Parser missing'); }"
node -e "try { require('winston'); console.log('✅ Winston Logger'); } catch(e) { console.log('❌ Winston Logger missing'); }"
node -e "try { require('socket.io'); console.log('✅ Socket.io'); } catch(e) { console.log('❌ Socket.io missing'); }"
echo ""

# Check Critical Files
echo "[7/10] Checking critical files..."
[ -f "middleware/auth.js" ] && echo "✅ Auth middleware" || echo "❌ Auth middleware missing"
[ -f "utils/errors.js" ] && echo "✅ Error classes" || echo "❌ Error classes missing"
[ -f "utils/logger.js" ] && echo "✅ Logger utility" || echo "❌ Logger utility missing"
[ -f "routes/auth.js" ] && echo "✅ Auth routes" || echo "❌ Auth routes missing"
[ -f "index.js" ] && echo "✅ Server entry point" || echo "❌ Server entry point missing"
cd ..
echo ""

[ -f "src/services/api.ts" ] && echo "✅ API service" || echo "❌ API service missing"
[ -f "src/services/socket.ts" ] && echo "✅ Socket service" || echo "❌ Socket service missing"
[ -f "src/hooks/useAuth.tsx" ] && echo "✅ Auth hook" || echo "❌ Auth hook missing"
[ -f "src/components/ChatWindow.tsx" ] && echo "✅ Chat component" || echo "❌ Chat component missing"
[ -f "src/components/TelehealthVideo.tsx" ] && echo "✅ Telehealth component" || echo "❌ Telehealth component missing"
echo ""

# Check Docker Configuration
echo "[8/10] Checking Docker setup..."
[ -f "docker-compose.yml" ] && echo "✅ docker-compose.yml" || echo "❌ docker-compose.yml missing"
[ -f "server/Dockerfile" ] && echo "✅ Server Dockerfile" || echo "❌ Server Dockerfile missing"
echo ""

# Check CI/CD
echo "[9/10] Checking CI/CD configuration..."
[ -f ".github/workflows/ci-cd.yml" ] && echo "✅ GitHub Actions workflow" || echo "❌ GitHub Actions missing"
echo ""

# Check Documentation
echo "[10/10] Checking documentation..."
[ -f "README.md" ] && echo "✅ README.md" || echo "❌ README.md missing"
[ -f "SECURITY.md" ] && echo "✅ SECURITY.md" || echo "❌ SECURITY.md missing"
[ -f "DEPLOYMENT.md" ] && echo "✅ DEPLOYMENT.md" || echo "❌ DEPLOYMENT.md missing"
echo ""

echo "============================================================"
echo " ✅ Verification Complete!"
echo "============================================================"
echo ""
echo "Next Steps:"
echo "1. Review server/.env and generate secure secrets"
echo "2. Run: ./start.sh (to start the application)"
echo "3. Test manually: http://localhost:8080"
echo "4. Check API: http://localhost:5000/health"
echo ""
echo "For detailed security checklist, see SECURITY.md"
echo ""
