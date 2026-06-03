const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const DoctorVerification = require('../models/DoctorVerification');
const { logEvent } = require('../middleware/logger');
const { commitToBlockchain } = require('../middleware/blockchain');
const { ValidationError } = require('../utils/errors');

// Validation rules for doctor verification submission
const verificationValidation = [
  body('registrationNumber')
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Registration number must be 3–30 characters')
    .matches(/^[A-Za-z0-9\-_/]+$/).withMessage('Registration number may only contain letters, numbers, hyphens, underscores, and slashes'),
  body('certificateUrl')
    .optional({ checkFalsy: true })
    .isURL({ protocols: ['https'], require_protocol: true }).withMessage('Certificate URL must be a valid HTTPS URL'),
  body('govtIdUrl')
    .optional({ checkFalsy: true })
    .isURL({ protocols: ['https'], require_protocol: true }).withMessage('Govt ID URL must be a valid HTTPS URL'),
];

// @route   POST api/doctors/verify
// @desc    Submit doctor verification
router.post('/verify', auth, verificationValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ValidationError('Invalid input', errors.array());
        }

        if (req.user.role !== 'doctor') {
            return res.status(403).json({ error: 'Forbidden: Only doctor accounts can submit verification' });
        }

        const { registrationNumber, certificateUrl, govtIdUrl } = req.body;
        let verification = await DoctorVerification.findOne({ doctorId: req.user.id });

        if (verification) {
            return res.status(400).json({ error: 'Verification already submitted' });
        }

        verification = new DoctorVerification({
            doctorId: req.user.id,
            registrationNumber,
            certificateUrl: certificateUrl || null,
            govtIdUrl: govtIdUrl || null,
            verificationStatus: 'pending'
        });

        await verification.save();

        // Commit to Mock Blockchain
        const txHash = await commitToBlockchain(verification.id, 'DoctorVerification', { registrationNumber });

        await logEvent(req.user.id, 'SUBMIT_DOCTOR_VERIFICATION', verification.id, 'DoctorVerification', { registrationNumber, blockchainTx: txHash }, req);
        res.json(verification);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message || 'Failed to submit verification', details: error.details || null });
    }
});

// @route   GET api/doctors/status
// @desc    Get doctor verification status
router.get('/status', auth, async (req, res) => {
    try {
        const verification = await DoctorVerification.findOne({ doctorId: req.user.id });
        if (verification) {
            await logEvent(req.user.id, 'VIEW_VERIFICATION_STATUS', verification.id, 'DoctorVerification', {}, req);
        }
        res.json(verification);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch verification status' });
    }
});

// @route   GET api/doctors/verified
// @desc    Get all verified doctors (paginated)
router.get('/verified', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const [verifiedDoctors, total] = await Promise.all([
            DoctorVerification.find({ verificationStatus: 'verified' })
                .populate('doctorId', 'fullName email')
                .skip(skip).limit(limit),
            DoctorVerification.countDocuments({ verificationStatus: 'verified' })
        ]);

        res.json({
            doctors: verifiedDoctors,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch verified doctors' });
    }
});

module.exports = router;
