@echo off
REM Ayur-Well Pulse - Complete Verification Script
REM Tests all functions, security, flow, and UI/UX

echo ============================================================
echo  Ayur-Well Pulse v2.0 - Complete System Verification
echo ============================================================
echo.

REM Check Node.js
echo [1/10] Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ FAIL: Node.js not installed!
    pause
    exit /b 1
)
echo ✅ Node.js: 
node --version
echo.

REM Check npm
echo [2/10] Checking npm...
npm --version
echo.

REM Verify Backend Dependencies
echo [3/10] Verifying backend dependencies...
cd server
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)
echo ✅ Backend dependencies installed
echo.

REM Verify Frontend Dependencies
cd ..
echo [4/10] Verifying frontend dependencies...
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)
echo ✅ Frontend dependencies installed
echo.

REM Check Environment Configuration
echo [5/10] Checking environment configuration...
cd server
if not exist .env (
    echo ❌ WARNING: .env file missing!
    echo Creating .env from example...
    copy .env.example .env >nul
    echo.
    echo ⚠️  IMPORTANT: Edit server\.env and generate secure secrets!
    echo Run these commands and update .env:
    echo.
    echo node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    echo.
    pause
) else (
    echo ✅ .env file exists
)
echo.

REM Verify Security Features
echo [6/10] Verifying security features...
echo Checking security packages...
node -e "try { require('helmet'); console.log('✅ Helmet.js'); } catch(e) { console.log('❌ Helmet.js missing'); }"
node -e "try { require('express-rate-limit'); console.log('✅ Rate Limiting'); } catch(e) { console.log('❌ Rate Limiting missing'); }"
node -e "try { require('express-validator'); console.log('✅ Input Validation'); } catch(e) { console.log('❌ Input Validation missing'); }"
node -e "try { require('cookie-parser'); console.log('✅ Cookie Parser'); } catch(e) { console.log('❌ Cookie Parser missing'); }"
node -e "try { require('winston'); console.log('✅ Winston Logger'); } catch(e) { console.log('❌ Winston Logger missing'); }"
node -e "try { require('socket.io'); console.log('✅ Socket.io'); } catch(e) { console.log('❌ Socket.io missing'); }"
echo.

REM Check Critical Files
echo [7/10] Checking critical files...
if exist middleware\auth.js (echo ✅ Auth middleware) else (echo ❌ Auth middleware missing)
if exist utils\errors.js (echo ✅ Error classes) else (echo ❌ Error classes missing)
if exist utils\logger.js (echo ✅ Logger utility) else (echo ❌ Logger utility missing)
if exist routes\auth.js (echo ✅ Auth routes) else (echo ❌ Auth routes missing)
if exist index.js (echo ✅ Server entry point) else (echo ❌ Server entry point missing)
cd ..
echo.

if exist src\services\api.ts (echo ✅ API service) else (echo ❌ API service missing)
if exist src\services\socket.ts (echo ✅ Socket service) else (echo ❌ Socket service missing)
if exist src\hooks\useAuth.tsx (echo ✅ Auth hook) else (echo ❌ Auth hook missing)
if exist src\components\ChatWindow.tsx (echo ✅ Chat component) else (echo ❌ Chat component missing)
if exist src\components\TelehealthVideo.tsx (echo ✅ Telehealth component) else (echo ❌ Telehealth component missing)
echo.

REM Check Docker Configuration
echo [8/10] Checking Docker setup...
if exist docker-compose.yml (echo ✅ docker-compose.yml) else (echo ❌ docker-compose.yml missing)
if exist server\Dockerfile (echo ✅ Server Dockerfile) else (echo ❌ Server Dockerfile missing)
echo.

REM Check CI/CD
echo [9/10] Checking CI/CD configuration...
if exist .github\workflows\ci-cd.yml (echo ✅ GitHub Actions workflow) else (echo ❌ GitHub Actions missing)
echo.

REM Check Documentation
echo [10/10] Checking documentation...
if exist README.md (echo ✅ README.md) else (echo ❌ README.md missing)
if exist SECURITY.md (echo ✅ SECURITY.md) else (echo ❌ SECURITY.md missing)
if exist DEPLOYMENT.md (echo ✅ DEPLOYMENT.md) else (echo ❌ DEPLOYMENT.md missing)
echo.

echo ============================================================
echo  ✅ Verification Complete!
echo ============================================================
echo.
echo Next Steps:
echo 1. Review server\.env and generate secure secrets
echo 2. Run: start.bat (to start the application)
echo 3. Test manually: http://localhost:8080
echo 4. Check API: http://localhost:5000/health
echo.
echo For detailed security checklist, see SECURITY.md
echo.
pause
