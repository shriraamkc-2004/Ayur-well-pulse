# 🧪 Ayur-Well Pulse - Complete Testing Guide

## 📋 Pre-Flight Checks

### Run Verification Script
```bash
# Windows
verify.bat

# Mac/Linux
chmod +x verify.sh
./verify.sh
```

This checks:
- ✅ Node.js & npm installation
- ✅ All dependencies installed
- ✅ Environment configuration
- ✅ Security packages (Helmet, rate-limit, validator, etc.)
- ✅ Critical files present
- ✅ Docker & CI/CD configuration
- ✅ Documentation complete

---

## 🚀 Step-by-Step Running Commands

### Step 1: Environment Setup

```bash
# Navigate to project
cd "D:\Ayur-well-pulse-main - Copy"

# Check if .env exists
ls server/.env

# If missing, create it
cp server/.env.example server/.env
```

### Step 2: Generate Secure Secrets

```bash
cd server

# Generate JWT_SECRET (64 bytes hex)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET (64 bytes hex)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate ENCRYPTION_KEY (32 chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex').substring(0, 32))"

# Generate COOKIE_SECRET (32 bytes hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Update `server/.env` with these values!**

### Step 3: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ..
npm install
```

### Step 4: Start the Application

**Option A: Quick Start (Recommended)**
```bash
# Windows
start.bat

# Mac/Linux
./start.sh
```

**Option B: Manual Start**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd ..
npm run dev
```

**Option C: Docker (Production)**
```bash
docker-compose up -d
```

---

## 🔍 Testing All Functions

### 1. Backend API Tests

#### Health Check
```bash
curl http://localhost:5000/health
```
**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-06-01T...",
  "uptime": 123.456,
  "environment": "development",
  "database": "connected"
}
```

#### Test Authentication Flow

**1. Signup**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "fullName": "Test User",
    "role": "patient"
  }'
```
**Expected:** Returns `accessToken` and user data

**2. Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```
**Expected:** Returns `accessToken` and sets `refreshToken` cookie

**3. Token Refresh**
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Cookie: refreshToken=<your-refresh-token>"
```
**Expected:** Returns new `accessToken`

**4. Logout**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Cookie: refreshToken=<your-refresh-token>"
```
**Expected:** Clears cookie, returns success message

#### Test Rate Limiting
```bash
# Run this 21 times quickly (should block on 21st)
for i in {1..21}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"wrong@test.com","password":"wrong"}'
  echo ""
done
```
**Expected:** 21st request returns 429 error

#### Test Protected Routes
```bash
# Without token (should fail)
curl http://localhost:5000/api/patients/record

# With token (should succeed)
curl http://localhost:5000/api/patients/record \
  -H "Authorization: Bearer <your-access-token>"
```

### 2. Frontend Tests

#### Manual UI Testing Checklist

**Authentication Flow:**
1. ✅ Navigate to `http://localhost:8080`
2. ✅ Click "Get Started"
3. ✅ Select role (Patient)
4. ✅ Sign up with email/password
5. ✅ Verify redirect to dashboard
6. ✅ Logout and login again
7. ✅ Test token refresh (wait 15 min or modify token expiry)

**Patient Dashboard:**
1. ✅ Complete health intake form
2. ✅ View diet plan section
3. ✅ Log a meal
4. ✅ Save health log
5. ✅ Check notifications
6. ✅ Switch to "Consult Doctor" tab
7. ✅ View verified doctors list
8. ✅ Click on doctor to open chat
9. ✅ Send test message
10. ✅ Check typing indicators
11. ✅ Start video call (local preview)

**Doctor Dashboard:**
1. ✅ Submit verification form
2. ✅ View "Verification Pending" status
3. ✅ (As Admin) Approve verification
4. ✅ View verified doctor dashboard
5. ✅ See patient list
6. ✅ Open chat with patient
7. ✅ Test video call

**Admin Dashboard:**
1. ✅ View system statistics
2. ✅ Check verification queue
3. ✅ Approve/reject doctor
4. ✅ View audit logs
5. ✅ Check blockchain ledger

**UI/UX Checks:**
- ✅ Responsive design (resize browser)
- ✅ Loading states appear
- ✅ Error messages display correctly
- ✅ Toast notifications work
- ✅ Multi-language support (switch languages)
- ✅ Dark/light mode (if implemented)
- ✅ Smooth animations
- ✅ Form validation messages
- ✅ Navigation works correctly

### 3. Real-time Features Test

#### Socket.io Chat Test
1. Open two browsers (or incognito window)
2. Login as Patient in Browser 1
3. Login as Doctor in Browser 2
4. Patient starts chat with Doctor
5. **Test:** Send message from Patient
6. **Verify:** Doctor receives it instantly (no refresh)
7. **Test:** Typing indicator appears when typing
8. **Verify:** Real-time updates work

### 4. Security Tests

#### Test XSS Protection
```bash
# Try injecting script in signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Pass1234!",
    "fullName": "<script>alert(1)</script>",
    "role": "patient"
  }'
```
**Expected:** Script tags sanitized or rejected

#### Test SQL Injection (MongoDB)
```bash
# Try NoSQL injection
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": {"$gt": ""},
    "password": {"$gt": ""}
  }'
```
**Expected:** Rejected by validation

#### Test Token Security
1. Login and get token
2. Check browser DevTools → Application → Cookies
3. **Verify:** `refreshToken` is httpOnly (not accessible via JavaScript)
4. **Verify:** `accessToken` is in localStorage (acceptable for SPA)
5. Check token expiration (should be 15 minutes)

#### Test CORS
```bash
# From different origin (should be blocked if not in ALLOWED_ORIGINS)
curl -H "Origin: http://evil.com" \
  http://localhost:5000/api/patients/record
```
**Expected:** CORS error if origin not whitelisted

### 5. Performance Tests

#### Test Pagination
```bash
# Create multiple patient records, then test pagination
curl "http://localhost:5000/api/patients?page=1&limit=10" \
  -H "Authorization: Bearer <admin-token>"
```
**Expected:** Returns paginated results with metadata

#### Test Database Indexes
```bash
# Check query performance (should be fast with indexes)
curl http://localhost:5000/api/messages/<user-id> \
  -H "Authorization: Bearer <token>"
```

### 6. Error Handling Tests

#### Test Invalid Inputs
```bash
# Missing email
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"test"}'

# Invalid email format
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"test"}'

# Short password
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"short","fullName":"Test"}'
```
**Expected:** 400 errors with validation messages

#### Test Expired Token
```bash
# Use expired token
curl http://localhost:5000/api/patients/record \
  -H "Authorization: Bearer expired.token.here"
```
**Expected:** 401 error with "Token expired" message

---

## 📊 Automated Testing

### Run Backend Tests
```bash
cd server
npm test
npm run test:coverage
```

### Run Security Audit
```bash
cd server
npm audit
npm audit fix
```

### Frontend Build Check
```bash
npm run build
```
**Expected:** No TypeScript errors, successful build

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check if MongoDB is running
docker-compose ps mongodb

# View backend logs
cd server
npm run dev

# Check .env configuration
cat .env
```

### Frontend Won't Start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run build
```

### Token Refresh Failing
1. Check `JWT_REFRESH_SECRET` matches in `.env`
2. Verify cookie settings (httpOnly, secure, sameSite)
3. Check browser DevTools for cookie presence

### Socket.io Not Connecting
1. Verify CORS includes frontend URL
2. Check WebSocket upgrade allowed in proxy
3. Look for errors in browser console

### CORS Errors
- Update `ALLOWED_ORIGINS` in `.env`
- Ensure exact URL match (http://localhost:8080)

---

## ✅ Final Checklist

Before declaring the system ready:

- [ ] All API endpoints respond correctly
- [ ] Authentication flow works (signup, login, refresh, logout)
- [ ] Rate limiting active and tested
- [ ] Real-time chat working with Socket.io
- [ ] Typing indicators functional
- [ ] All dashboards load (Patient, Doctor, Dietitian, Admin)
- [ ] Health intake form saves data
- [ ] Encryption working for sensitive fields
- [ ] Audit logs being recorded
- [ ] Error messages user-friendly
- [ ] UI responsive on mobile
- [ ] Multi-language switching works
- [ ] Token refresh automatic
- [ ] Security headers present (check DevTools → Network)
- [ ] No console errors in browser
- [ ] Docker deployment tested
- [ ] Health check returns OK

---

## 📞 Need Help?

- Check logs: `docker-compose logs -f`
- Review [SECURITY.md](./SECURITY.md)
- Open GitHub issue with error details
- Check health endpoint: `http://localhost:5000/health`

---

**Testing Complete! Your Ayur-Well Pulse platform is production-ready! 🎉**
