const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logEvent } = require('../middleware/logger');

// @route   POST api/auth/signup
// @desc    Register user
router.post('/signup', async (req, res) => {
    try {
        const { email, password, fullName, role } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        user = new User({ email, password, fullName, role });
        await user.save();

        await logEvent(user.id, 'USER_SIGNUP', user.id, 'User', { role }, req);

        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            await logEvent(user.id, 'AUTH_FAILED', user.id, 'User', { email }, req);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        await logEvent(user.id, 'USER_LOGIN', user.id, 'User', {}, req);

        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
