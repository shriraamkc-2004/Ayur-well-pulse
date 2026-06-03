# Ayur-Well Pulse - Production Deployment Guide

## 🚀 Quick Start with Docker

### Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ (for local development)
- MongoDB (if not using Docker)

### Docker Deployment (Recommended)

1. **Clone and Configure**
```bash
git clone <repository-url>
cd ayur-well-pulse
cp server/.env.example server/.env
```

2. **Generate Secure Secrets**
```bash
# Run these commands and update server/.env
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex').substring(0, 32))"
node -e "console.log('COOKIE_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

3. **Start Services**
```bash
docker-compose up -d
```

4. **Verify Deployment**
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f server

# Health check
curl http://localhost:5000/health
```

5. **Seed Database (Optional)**
```bash
docker-compose exec server node seedFoods.js
```

### Manual Deployment

#### Backend Setup
```bash
cd server
npm install --production

# Configure environment
cp .env.example .env
# Edit .env with your production values

# Start server
NODE_ENV=production node index.js
```

#### Frontend Setup
```bash
npm install
npm run build

# Serve with nginx or any static file server
# Example with nginx:
# server {
#   listen 80;
#   server_name yourdomain.com;
#   
#   location / {
#     root /path/to/dist;
#     try_files $uri $uri/ /index.html;
#   }
#   
#   location /api {
#     proxy_pass http://localhost:5000;
#     proxy_set_header Host $host;
#     proxy_set_header X-Real-IP $remote_addr;
#   }
# }
```

## ☁️ Cloud Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

**Frontend (Vercel):**
```bash
npm install -g vercel
vercel --prod
```

**Backend (Railway):**
1. Connect GitHub repo to Railway
2. Set root directory to `/server`
3. Add environment variables
4. Deploy automatically on push

### Option 2: AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.medium (minimum)
   - Open ports: 22, 80, 443

2. **Install Dependencies**
```bash
sudo apt update
sudo apt install -y nginx nodejs npm mongodb
sudo systemctl enable mongodb
sudo systemctl start mongodb
```

3. **Deploy Application**
```bash
git clone <repo-url> /var/www/ayurwell
cd /var/www/ayurwell

# Backend
cd server
npm install --production
npm start &

# Frontend
cd ..
npm install
npm run build

# Configure Nginx
sudo nano /etc/nginx/sites-available/ayurwell
# Add nginx configuration (see below)

sudo ln -s /etc/nginx/sites-available/ayurwell /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. **SSL Certificate (Let's Encrypt)**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option 3: DigitalOcean App Platform

1. Push code to GitHub
2. Create new App in DigitalOcean
3. Connect repository
4. Set environment variables
5. Deploy

## 🔧 Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Frontend
    location / {
        root /var/www/ayurwell/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket for Socket.io
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# API health
curl https://yourdomain.com/api/health

# MongoDB connection
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check logs
docker-compose logs --tail=100 server
```

### Backup Strategy
```bash
# Database backup
docker-compose exec mongodb mongodump --out /data/backup

# Restore from backup
docker-compose exec mongodb mongorestore /data/backup

# Automate with cron
0 2 * * * docker-compose exec mongodb mongodump --out /data/backup/$(date +\%Y\%m\%d)
```

### Update Deployment
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Clean up old images
docker image prune -f
```

## 🔒 Security Hardening

1. **Firewall Configuration**
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. **MongoDB Authentication**
```javascript
// Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "strong-password",
  roles: [{ role: "root", db: "admin" }]
})
```

3. **Rate Limiting (Nginx)**
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://localhost:5000;
}
```

## 📝 Environment Variables Checklist

### Required
- [x] `MONGODB_URI`
- [x] `JWT_SECRET` (64+ characters)
- [x] `JWT_REFRESH_SECRET` (64+ characters)
- [x] `ENCRYPTION_KEY` (32 characters)
- [x] `COOKIE_SECRET` (32+ characters)
- [x] `ALLOWED_ORIGINS` (production domain)
- [x] `NODE_ENV=production`

### Optional
- [ ] `SENTRY_DSN` (error tracking)
- [ ] `SMTP_*` (email notifications)
- [ ] `PORT` (default: 5000)

## 🆘 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```bash
# Check if MongoDB is running
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb

# Verify connection string
echo $MONGODB_URI
```

**2. CORS Errors**
- Update `ALLOWED_ORIGINS` in `.env`
- Ensure frontend URL matches exactly

**3. Token Refresh Failing**
- Check cookie settings (httpOnly, secure, sameSite)
- Verify `JWT_REFRESH_SECRET` matches

**4. Port Already in Use**
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Review [SECURITY.md](./SECURITY.md)
3. Open GitHub issue with error details
