const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DoctorVerification = require('../models/DoctorVerification');
const { logEvent } = require('../middleware/logger');
const { commitToBlockchain } = require('../middleware/blockchain');

// @route   POST api/doctors/verify
// @desc    Submit doctor verification
router.post('/verify', auth, async (req, res) => {
    try {
        const { registrationNumber, certificateUrl, govtIdUrl } = req.body;
        let verification = await DoctorVerification.findOne({ doctorId: req.user.id });

        if (verification) {
            return res.status(400).json({ error: 'Verification already submitted' });
        }

        verification = new DoctorVerification({
            doctorId: req.user.id,
            registrationNumber,
            certificateUrl,
            govtIdUrl,
            verificationStatus: 'pending'
        });

        await verification.save();

        // Commit to Mock Blockchain
        const txHash = await commitToBlockchain(verification.id, 'DoctorVerification', { registrationNumber });

        await logEvent(req.user.id, 'SUBMIT_DOCTOR_VERIFICATION', verification.id, 'DoctorVerification', { registrationNumber, blockchainTx: txHash }, req);
        res.json(verification);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
