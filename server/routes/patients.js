const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PatientRecord = require('../models/PatientRecord');
const { encrypt, decrypt } = require('../middleware/encryption');
const { logEvent } = require('../middleware/logger');

// @route   POST api/patients/record
// @desc    Submit patient intake form
router.post('/record', auth, async (req, res) => {
    try {
        const { dateOfBirth, gender, lifestyleNotes, allergies, conditions } = req.body;
        let record = await PatientRecord.findOne({ patientId: req.user.id });

        // Encrypt sensitive fields
        const encryptedLifestyle = lifestyleNotes ? encrypt(lifestyleNotes) : null;

        if (record) {
            record.dateOfBirth = dateOfBirth;
            record.gender = gender;
            record.lifestyleNotes = encryptedLifestyle;
            record.allergies = allergies;
            record.conditions = conditions;
            record.updatedAt = Date.now();
        } else {
            record = new PatientRecord({
                patientId: req.user.id,
                dateOfBirth,
                gender,
                lifestyleNotes: encryptedLifestyle,
                allergies,
                conditions
            });
        }

        await record.save();
        await logEvent(req.user.id, 'SAVE_PATIENT_RECORD', record.id, 'PatientRecord', {}, req);
        res.json({ ...record.toObject(), lifestyleNotes }); // Return unencrypted to frontend
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   GET api/patients/record
// @desc    Get patient health record
router.get('/record', auth, async (req, res) => {
    try {
        const record = await PatientRecord.findOne({ patientId: req.user.id });
        if (!record) return res.json(null);

        await logEvent(req.user.id, 'VIEW_PATIENT_RECORD', record.id, 'PatientRecord', {}, req);

        const decryptedRecord = record.toObject();
        if (decryptedRecord.lifestyleNotes) {
            decryptedRecord.lifestyleNotes = decrypt(decryptedRecord.lifestyleNotes);
        }

        res.json(decryptedRecord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
