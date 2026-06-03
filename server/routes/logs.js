const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const HealthLog = require('../models/HealthLog');
const { logEvent } = require('../middleware/logger');
const { parseTextToMeals } = require('../utils/aiEngine');
const rateLimit = require('express-rate-limit');

// Strict rate limiter for AI parsing (expensive DB regex queries)
const aiParseLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: { error: 'Too many AI parse requests. Please wait before trying again.' }
});

// @route   POST api/logs
// @desc    Add a health/meal log
router.post('/', auth, async (req, res) => {
    try {
        const { vitals, symptoms, mood, digestion, energyLevel, meals, waterIntake, notes } = req.body;
        const log = new HealthLog({
            patientId: req.user.id,
            vitals, symptoms, mood, digestion, energyLevel, meals, waterIntake, notes
        });
        await log.save();
        await logEvent(req.user.id, 'CREATE_HEALTH_LOG', log.id, 'HealthLog', {}, req);
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create health log' });
    }
});

// @route   GET api/logs
// @desc    Get patient logs with pagination
router.get('/', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            HealthLog.find({ patientId: req.user.id }).sort({ date: -1 }).skip(skip).limit(limit),
            HealthLog.countDocuments({ patientId: req.user.id })
        ]);

        res.json({
            logs,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch health logs' });
    }
});

// @route   POST api/logs/ai-parse
// @desc    NLP meal text parsing (AI Microservice stub)
router.post('/ai-parse', auth, aiParseLimiter, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text is required' });
        }
        // Limit text length to prevent abuse
        const sanitizedText = text.trim().substring(0, 2000);

        const detectedFoods = await parseTextToMeals(sanitizedText);
        res.json({
            originalText: sanitizedText,
            detectedFoods,
            suggestion: detectedFoods.length > 0
                ? 'I detected some Ayurvedic foods in your log!'
                : "I couldn't detect specific foods. Please try adding more details."
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to parse meal text' });
    }
});

// @route   GET api/logs/patient/:patientId
// @desc    Get specific patient's logs (Doctors/Dietitians/Admins only)
router.get('/patient/:patientId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'doctor' && req.user.role !== 'dietitian' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Doctor, Dietitian, or Admin role required' });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            HealthLog.find({ patientId: req.params.patientId }).sort({ date: -1 }).skip(skip).limit(limit),
            HealthLog.countDocuments({ patientId: req.params.patientId })
        ]);

        res.json({
            logs,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patient logs' });
    }
});

module.exports = router;

