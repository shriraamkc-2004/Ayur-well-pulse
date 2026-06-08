const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./utils/logger');
const { AppError } = require('./utils/errors');

dotenv.config();

// ─── Startup Secret Validation ───────────────────────────────────────────────
// Fail fast if critical secrets are missing in production
const REQUIRED_SECRETS = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'COOKIE_SECRET'];
const missingSecrets = REQUIRED_SECRETS.filter(key => !process.env[key]);

if (missingSecrets.length > 0 && process.env.NODE_ENV === 'production') {
  console.error(`❌ FATAL: Missing required environment variables: ${missingSecrets.join(', ')}`);
  console.error('   Generate them with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set — using a random ephemeral secret (tokens will be invalid after restart)');
  process.env.JWT_SECRET = require('crypto').randomBytes(64).toString('hex');
}
if (!process.env.JWT_REFRESH_SECRET) {
  console.warn('⚠️  JWT_REFRESH_SECRET not set — using a random ephemeral secret');
  process.env.JWT_REFRESH_SECRET = require('crypto').randomBytes(64).toString('hex');
}
// ─────────────────────────────────────────────────────────────────────────────

const app = express();

// Trust proxy — required behind Render's reverse proxy for correct IP detection
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const server = createServer(app);

// Initialize Socket.IO for real-time communication
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:8080',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Security Middleware
app.use(helmet()); // Security headers

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, ip: false }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  message: { error: 'Too many authentication attempts, please try again later' },
  validate: { xForwardedForHeader: false, ip: false }
});

app.use('/api/auth/', authLimiter);
app.use(generalLimiter);

// Body parsing middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// MongoDB Connection (Optional - Server works without it)
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      logger.info('✅ MongoDB Connected Successfully');
      app.set('dbConnected', true);
    })
    .catch(err => {
      logger.warn('⚠️ MongoDB Connection Failed (Running in Mock Mode)');
      logger.warn('   Error:', err.message);
      app.set('dbConnected', false);
    });

  // Connection event listeners
  mongoose.connection.on('error', err => {
    logger.error('MongoDB connection error:', err);
    app.set('dbConnected', false);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
    app.set('dbConnected', false);
  });
} else {
  logger.info('ℹ️ No MongoDB URI configured - Running in Mock Mode');
  app.set('dbConnected', false);
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  const dbConnected = app.get('dbConnected') || false;
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: dbConnected ? 'connected' : 'mock mode',
    mode: dbConnected ? 'full' : 'mock'
  });
});

// Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Ayur-Well Pulse API is running. Access endpoints at /api/*' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/foods', require('./routes/foods'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/diet-plans', require('./routes/dietPlans'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    logger.warn('Socket.IO auth failed', { error: err.message, ip: socket.handshake.address });
    next(new Error('Invalid authentication token'));
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id} (user: ${socket.userId})`);
  
  // Auto-join user to their own room (no manual join needed, prevents impersonation)
  socket.join(socket.userId);
  
  // Handle chat messages
  socket.on('send_message', (data) => {
    const { receiverId, message } = data;

    // Validate receiverId — prevent sending to arbitrary/nonexistent users
    if (!receiverId || typeof receiverId !== 'string' || receiverId.trim().length === 0) {
      logger.warn(`Invalid receiverId from ${socket.userId}`, { receiverId });
      return;
    }

    // Prevent self-messaging loops
    if (receiverId === socket.userId) {
      logger.debug(`Self-message ignored from ${socket.userId}`);
      return;
    }

    // Attach verified sender identity to prevent spoofing
    io.to(receiverId).emit('receive_message', {
      ...message,
      sender: socket.userId
    });
    logger.debug(`Message from ${socket.userId} to ${receiverId}`);
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    if (data?.receiverId && typeof data.receiverId === 'string') {
      socket.to(data.receiverId).emit('user_typing', { senderId: socket.userId });
    }
  });
  
  socket.on('stop_typing', (data) => {
    if (data?.receiverId && typeof data.receiverId === 'string') {
      socket.to(data.receiverId).emit('user_stopped_typing', { senderId: socket.userId });
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// 404 Handler - Must be after all routes in Express 5
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global Error Handler
app.use((err, req, res, next) => {
  // Handle malformed JSON body (bad curl request, etc.)
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400 && 'body' in err)) {
    logger.warn('Malformed JSON in request body', { url: req.originalUrl, method: req.method });
    return res.status(400).json({ status: 'error', error: 'Invalid JSON in request body' });
  }

  // Don't log 404s as errors — they're expected (health probes, bots, etc.)
  const statusCode = err.statusCode || 500;
  if (statusCode === 404) {
    logger.debug(`404: ${req.method} ${req.originalUrl}`);
    return res.status(404).json({ status: 'error', error: 'Route not found' });
  }

  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });
  
  const message = process.env.NODE_ENV === 'production' && statusCode === 500 
    ? 'Internal server error' 
    : err.message;
  
  res.status(statusCode).json({
    status: err.status || 'error',
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📡 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed');
    // Close MongoDB connection if active
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close(() => {
        logger.info('MongoDB connection closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
  // Force exit after 10 seconds if graceful shutdown stalls
  setTimeout(() => {
    logger.error('Forced shutdown after 10s timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };
