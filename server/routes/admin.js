const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const DoctorVerification = require('../models/DoctorVerification');
const AuditLog = require('../models/AuditLog');
const BlockchainLedger = require('../models/BlockchainLedger');
const { logEvent } = require('../middleware/logger');

// Middleware: check admin role
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: admin access required' });
    }
    next();
};

// @route   GET api/admin/dashboard
// @desc    Get platform summary stats
router.get('/dashboard', auth, adminOnly, async (req, res) => {
    try {
        const [totalUsers, verifiedDoctors, pendingVerifications, auditLogs, blockchainEntries] = await Promise.all([
            User.countDocuments(),
            DoctorVerification.countDocuments({ verificationStatus: 'verified' }),
            DoctorVerification.countDocuments({ verificationStatus: 'pending' }),
            AuditLog.find().sort({ timestamp: -1 }).limit(20),
            BlockchainLedger.find().sort({ timestamp: -1 }).limit(10)
        ]);

        res.json({ totalUsers, verifiedDoctors, pendingVerifications, recentAuditLogs: auditLogs, recentBlockchainEntries: blockchainEntries });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// @route   GET api/admin/users
// @desc    List all users
router.get('/users', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// @route   GET api/admin/verifications
// @desc    List all pending doctor verifications
router.get('/verifications', auth, adminOnly, async (req, res) => {
    try {
        const verifications = await DoctorVerification.find({ verificationStatus: 'pending' }).populate('doctorId', 'fullName email');
        res.json(verifications);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch verifications' });
    }
});

// @route   PUT api/admin/verifications/:id/approve
// @desc    Approve a doctor verification
router.put('/verifications/:id/approve', auth, adminOnly, async (req, res) => {
    try {
        const verification = await DoctorVerification.findByIdAndUpdate(
            req.params.id,
            { verificationStatus: 'verified', verifiedAt: new Date() },
            { new: true }
        );
        if (!verification) return res.status(404).json({ error: 'Verification not found' });
        await logEvent(req.user.id, 'ADMIN_APPROVE_DOCTOR', verification.id, 'DoctorVerification', {}, req);
        res.json(verification);
    } catch (err) {
        res.status(500).json({ error: 'Failed to approve verification' });
    }
});

// @route   PUT api/admin/verifications/:id/reject
// @desc    Reject a doctor verification
router.put('/verifications/:id/reject', auth, adminOnly, async (req, res) => {
    try {
        const verification = await DoctorVerification.findByIdAndUpdate(
            req.params.id,
            { verificationStatus: 'rejected' },
            { new: true }
        );
        if (!verification) return res.status(404).json({ error: 'Verification not found' });
        await logEvent(req.user.id, 'ADMIN_REJECT_DOCTOR', verification.id, 'DoctorVerification', {}, req);
        res.json(verification);
    } catch (err) {
        res.status(500).json({ error: 'Failed to reject verification' });
    }
});

module.exports = router;
