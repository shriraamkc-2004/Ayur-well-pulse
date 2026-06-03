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
        res.status(500).json({ error: 'Failed to fetch current diet plan' });
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
        res.status(500).json({ error: 'Failed to generate diet plan' });
    }
});

// @route   GET api/diet-plans
// @desc    Get all diet plans for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const plans = await DietPlan.find({ patientId: req.user.id }).sort({ createdAt: -1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch diet plans' });
    }
});

// @route   GET api/diet-plans/:id
// @desc    Get a specific diet plan
router.get('/:id', auth, async (req, res) => {
    try {
        const plan = await DietPlan.findById(req.params.id)
            .populate('weeklyPlan.breakfast weeklyPlan.lunch weeklyPlan.dinner weeklyPlan.snacks');
        if (!plan) return res.status(404).json({ error: 'Diet plan not found' });
        
        if (
            plan.patientId.toString() !== req.user.id &&
            req.user.role !== 'doctor' &&
            req.user.role !== 'dietitian' &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to view this diet plan' });
        }

        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch diet plan' });
    }
});

// @route   PUT api/diet-plans/:id
// @desc    Update a diet plan (owner, dietitian, or admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        const plan = await DietPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ error: 'Diet plan not found' });

        // Authorization: only the plan owner, dietitians, or admins can update
        if (
            plan.patientId.toString() !== req.user.id &&
            req.user.role !== 'dietitian' &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ error: 'Forbidden: You can only update your own diet plan' });
        }

        // Whitelist updatable fields — prevent mass assignment attacks
        const ALLOWED_FIELDS = ['title', 'theme', 'ayurvedicAdvice', 'weeklyPlan', 'status'];
        const updateData = {};
        for (const field of ALLOWED_FIELDS) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        const updatedPlan = await DietPlan.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        await logEvent(req.user.id, 'UPDATE_DIET_PLAN', updatedPlan.id, 'DietPlan', {}, req);
        res.json(updatedPlan);
    } catch (err) {
        res.status(400).json({ error: 'Failed to update diet plan' });
    }
});

// @route   DELETE api/diet-plans/:id
// @desc    Delete a diet plan (owner or admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const plan = await DietPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ error: 'Diet plan not found' });

        // Authorization: only the plan owner or admins can delete
        if (plan.patientId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: You can only delete your own diet plan' });
        }

        await DietPlan.findByIdAndDelete(req.params.id);
        await logEvent(req.user.id, 'DELETE_DIET_PLAN', req.params.id, 'DietPlan', {}, req);
        res.json({ message: 'Diet plan deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete diet plan' });
    }
});

module.exports = router;
