const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const HealthLog = require('../models/HealthLog');
const { logEvent } = require('../middleware/logger');
const { parseTextToMeals } = require('../utils/aiEngine');

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
        res.status(500).json({ error: error.message });
    }
});

// @route   GET api/logs
// @desc    Get patient logs
router.get('/', auth, async (req, res) => {
    try {
        const logs = await HealthLog.find({ patientId: req.user.id }).sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   POST api/logs/ai-parse
// @desc    NLP meal text parsing (AI Microservice stub)
router.post('/ai-parse', auth, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Text is required' });

        const detectedFoods = await parseTextToMeals(text);
        res.json({
            originalText: text,
            detectedFoods,
            suggestion: detectedFoods.length > 0
                ? 'I detected some Ayurvedic foods in your log!'
                : "I couldn't detect specific foods. Please try adding more details."
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

