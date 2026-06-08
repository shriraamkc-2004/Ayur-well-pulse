const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { logEvent } = require('../middleware/logger');
const logger = require('../utils/logger');
const { ValidationError, AuthenticationError } = require('../utils/errors');
const { sendWelcomeEmail, sendLoginNotificationEmail } = require('../utils/email');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT tokens
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '1h' }
  );
  
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d' }
  );
  
  return { accessToken, refreshToken };
};

// Validation middleware
const signupValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  body('role').optional().isIn(['patient', 'dietitian', 'doctor', 'admin']).withMessage('Invalid role')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// @route   POST api/auth/signup
// @desc    Register user
router.post('/signup', signupValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid input', errors.array());
    }

    const { email, password, fullName, role = 'patient' } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      throw new ValidationError('User already exists with this email');
    }

    // Create user
    user = new User({ email, password, fullName, role });
    await user.save();

    // Log event
    await logEvent(user.id, 'USER_SIGNUP', user.id, 'User', { role }, req);
    logger.info(`New user registered: ${user.id}`, { userId: user.id, role });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.fullName).catch(err =>
      logger.warn('Welcome email failed', { error: err.message })
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json({ 
      accessToken,
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName, 
        role: user.role 
      } 
    });
  } catch (error) {
    logger.error('Signup error', { error: error.message, email: req.body.email });
    res.status(error.statusCode || 500).json({ 
      error: error.message,
      details: error.details || null
    });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid input', errors.array());
    }

    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await logEvent(user.id, 'AUTH_FAILED', user.id, 'User', { email }, req);
      logger.warn(`Failed login attempt for: ${email}`, { ip: req.ip });
      throw new AuthenticationError('Invalid email or password');
    }

    // Log successful login
    await logEvent(user.id, 'USER_LOGIN', user.id, 'User', {}, req);
    logger.info(`User logged in: ${user.id}`, { userId: user.id });

    // Send login notification email (non-blocking)
    sendLoginNotificationEmail(user.email, user.fullName, req.ip).catch(err =>
      logger.warn('Login notification email failed', { error: err.message })
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({ 
      accessToken,
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName, 
        role: user.role 
      } 
    });
  } catch (error) {
    logger.error('Login error', { error: error.message, email: req.body.email });
    res.status(error.statusCode || 500).json({ 
      error: error.message,
      details: error.details || null
    });
  }
});

// @route   POST api/auth/google
// @desc    Login or signup with Google OAuth (accepts access token from frontend)
router.post('/google', async (req, res) => {
  try {
    const { credential, role = 'patient' } = req.body;
    if (!credential) {
      throw new ValidationError('Google credential is required');
    }

    // Use access token to fetch user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${credential}` },
    });
    if (!userInfoRes.ok) {
      throw new AuthenticationError('Invalid Google token');
    }
    const payload = await userInfoRes.json();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        fullName: name || email.split('@')[0],
        googleId,
        avatarUrl: picture,
        role,
      });
      await user.save();
      logger.info(`Google user registered: ${user.id}`, { userId: user.id, role });
      await logEvent(user.id, 'USER_SIGNUP_GOOGLE', user.id, 'User', { role }, req);
      // Send welcome email for new Google users
      sendWelcomeEmail(user.email, user.fullName).catch(err =>
        logger.warn('Welcome email failed (Google)', { error: err.message })
      );
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (picture && !user.avatarUrl) user.avatarUrl = picture;
      await user.save();
    }

    await logEvent(user.id, 'USER_LOGIN_GOOGLE', user.id, 'User', {}, req);
    logger.info(`Google login: ${user.id}`, { userId: user.id });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Google login error', { error: error.message });
    res.status(error.statusCode || 500).json({
      error: error.message || 'Google login failed'
    });
  }
});

// @route   POST api/auth/refresh
// @desc    Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token required');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Rotate both tokens — old refresh token is invalidated
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role);

    // Set new refresh token in httpOnly cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    logger.debug(`Token refreshed (rotated) for user: ${user.id}`, { userId: user.id });
    res.json({ accessToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    logger.error('Token refresh error', { error: error.message });
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// @route   POST api/auth/logout
// @desc    Logout user
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  logger.info('User logged out');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
