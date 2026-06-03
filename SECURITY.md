# Ayur-Well Pulse Security Configuration Guide

## 🔒 Security Features Implemented

### 1. Authentication & Authorization
- ✅ JWT with short-lived access tokens (15 minutes)
- ✅ Refresh tokens stored in httpOnly cookies (7 days)
- ✅ Automatic token refresh on expiration
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting on auth endpoints (20 requests/15 min)

### 2. Data Protection
- ✅ AES-256-GCM encryption for sensitive data at rest
- ✅ Encrypted messages and lifestyle notes
- ✅ Helmet.js security headers
- ✅ CORS with whitelisted origins
- ✅ Input validation with express-validator

### 3. API Security
- ✅ Request size limits (10mb)
- ✅ Rate limiting (100 requests/15 min general)
- ✅ SQL injection prevention (MongoDB parameterized queries)
- ✅ XSS protection (helmet, input sanitization)
- ✅ CSRF protection (httpOnly cookies)

### 4. Monitoring & Logging
- ✅ Winston structured logging
- ✅ Audit trails for all critical actions
- ✅ Error tracking with stack traces (dev mode)
- ✅ Health check endpoint (`/health`)

### 5. Network Security
- ✅ HTTPS enforcement in production
- ✅ Secure cookie flags (httpOnly, secure, sameSite)
- ✅ Socket.io for real-time communication
- ✅ Connection pooling for MongoDB

## 🚀 Production Deployment Checklist

### Environment Variables Required
```bash
# Generate secure secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex').substring(0, 32))"
node -e "console.log('COOKIE_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### Pre-Launch Security Audit
- [ ] Replace all default secrets in `.env`
- [ ] Enable HTTPS (Let's Encrypt or cloud provider)
- [ ] Update `ALLOWED_ORIGINS` to production domain
- [ ] Enable MongoDB authentication
- [ ] Set `NODE_ENV=production`
- [ ] Configure firewall rules (only ports 80, 443, 5000)
- [ ] Set up automated backups
- [ ] Enable Sentry for error tracking (optional)
- [ ] Review and restrict CORS origins
- [ ] Test rate limiting effectiveness
- [ ] Run `npm audit` and fix vulnerabilities

### Ongoing Security Maintenance
- [ ] Rotate JWT secrets every 90 days
- [ ] Review audit logs weekly
- [ ] Update dependencies monthly
- [ ] Monitor rate limit violations
- [ ] Backup database daily
- [ ] Test disaster recovery quarterly

## 📊 Security Headers (Helmet.js)

The following security headers are automatically applied:
- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection`
- `Strict-Transport-Security` (production)
- `X-DNS-Prefetch-Control: off`
- `X-Download-Options: noopen`
- `X-Permitted-Cross-Domain-Policies: none`
- `Referrer-Policy: no-referrer`

## 🔐 Password Requirements
- Minimum 8 characters
- Should include uppercase, lowercase, numbers, symbols
- bcrypt hashing with salt rounds = 10

## 🛡️ Rate Limits
- **Auth endpoints**: 20 requests per 15 minutes
- **General API**: 100 requests per 15 minutes
- Configurable via environment variables

## 📝 Audit Log Events
All critical actions are logged:
- User signup/login/logout
- Authentication failures
- Patient record access/modification
- Message send/receive
- Doctor verification submissions
- Admin actions (approve/reject)

## 🚨 Incident Response

### If Security Breach Detected:
1. Rotate all JWT secrets immediately
2. Force logout all users (clear refresh tokens)
3. Review audit logs for suspicious activity
4. Notify affected users
5. Patch vulnerability
6. Monitor for further attacks

### Emergency Contacts:
- Add your security team contact info here
- Set up PagerDuty/OpsGenie alerts

## 📚 Additional Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
