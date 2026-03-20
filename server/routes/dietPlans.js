const express = require('express');
const router = express.Router();
const DietPlan = require('../models/DietPlan');
const PatientRecord = require('../models/PatientRecord');
const auth = require('../middleware/auth');
const { logEvent } = require('../middleware/logger');
const { commitToBlockchain } = require('../middleware/blockchain');
const { generateDietPlanForPatient } = require('../utils/aiEngine');

// @route   GET api/diet-plans/current
// @desc    Get the current active diet plan for the patient
router.get('/current', auth, async (req, res) => {
    try {
        const plan = await DietPlan.findOne({ patientId: req.user.id, status: 'active' })
            .populate('weeklyPlan.breakfast weeklyPlan.lunch weeklyPlan.dinner weeklyPlan.snacks');
        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST api/diet-plans/generate
// @desc    AI-generate a new diet plan based on the patient's dosha profile
router.post('/generate', auth, async (req, res) => {
    try {
        const patientRecord = await PatientRecord.findOne({ patientId: req.user.id });

        // Deactivate any existing active plan
        await DietPlan.updateMany({ patientId: req.user.id, status: 'active' }, { status: 'past' });

        // Generate new plan via AI engine stub
        const planData = await generateDietPlanForPatient(patientRecord);

        const plan = new DietPlan({
            patientId: req.user.id,
            ...planData,
            startDate: new Date(),
            status: 'active'
        });

        await plan.save();

        // Commit plan hash to the blockchain ledger for auditability
        const txHash = await commitToBlockchain(plan.id, 'DietPlan', { title: plan.title });

        await logEvent(req.user.id, 'GENERATE_DIET_PLAN', plan.id, 'DietPlan', { blockchainTx: txHash }, req);

        // Return populated plan
        const populatedPlan = await plan.populate('weeklyPlan.breakfast weeklyPlan.lunch weeklyPlan.dinner weeklyPlan.snacks');
        res.json(populatedPlan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET api/diet-plans
// @desc    Get all diet plans for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const plans = await DietPlan.find({ patientId: req.user.id }).sort({ createdAt: -1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET api/diet-plans/:id
// @desc    Get a specific diet plan
router.get('/:id', auth, async (req, res) => {
    try {
        const plan = await DietPlan.findById(req.params.id)
            .populate('weeklyPlan.breakfast weeklyPlan.lunch weeklyPlan.dinner weeklyPlan.snacks');
        if (!plan) return res.status(404).json({ error: 'Diet plan not found' });
        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT api/diet-plans/:id
// @desc    Update a diet plan (dietitian)
router.put('/:id', auth, async (req, res) => {
    try {
        const plan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!plan) return res.status(404).json({ error: 'Diet plan not found' });
        await logEvent(req.user.id, 'UPDATE_DIET_PLAN', plan.id, 'DietPlan', {}, req);
        res.json(plan);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// @route   DELETE api/diet-plans/:id
// @desc    Delete a diet plan
router.delete('/:id', auth, async (req, res) => {
    try {
        const plan = await DietPlan.findByIdAndDelete(req.params.id);
        if (!plan) return res.status(404).json({ error: 'Diet plan not found' });
        res.json({ message: 'Diet plan deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
