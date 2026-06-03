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

        // Calculate a mock/realistic dosha profile based on lifestyle notes
        const text = lifestyleNotes?.toLowerCase() || '';
        let v = 33, p = 33, k = 34;
        if (text.includes('dry') || text.includes('cold') || text.includes('anxiety') || text.includes('constipation')) {
            v += 20; p -= 10; k -= 10;
        }
        if (text.includes('hot') || text.includes('acid') || text.includes('anger') || text.includes('acne') || text.includes('spicy')) {
            p += 20; v -= 10; k -= 10;
        }
        if (text.includes('heavy') || text.includes('slow') || text.includes('weight') || text.includes('lethargy') || text.includes('sweet')) {
            k += 20; v -= 10; p -= 10;
        }
        const doshaProfile = { vata: v, pitta: p, kapha: k };

        // Encrypt sensitive fields
        const encryptedLifestyle = lifestyleNotes ? encrypt(lifestyleNotes) : null;

        if (record) {
            record.dateOfBirth = dateOfBirth;
            record.gender = gender;
            record.lifestyleNotes = encryptedLifestyle;
            record.allergies = allergies;
            record.conditions = conditions;
            record.doshaProfile = doshaProfile;
        } else {
            record = new PatientRecord({
                patientId: req.user.id,
                dateOfBirth,
                gender,
                lifestyleNotes: encryptedLifestyle,
                allergies,
                conditions,
                doshaProfile
            });
        }

        await record.save();
        await logEvent(req.user.id, 'SAVE_PATIENT_RECORD', record.id, 'PatientRecord', {}, req);
        res.json({ ...record.toObject(), lifestyleNotes }); // Return unencrypted to frontend
    } catch (error) {
        res.status(500).json({ error: 'Failed to save patient record' });
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
        res.status(500).json({ error: 'Failed to fetch patient record' });
    }
});

// @route   GET api/patients
// @desc    Get all patient records (Doctors/Admins only) with pagination
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Doctor/Admin role required' });
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const records = await PatientRecord.find()
      .skip(skip)
      .limit(limit)
      .populate('patientId', 'fullName email')
      .sort({ createdAt: -1 });
    
    const total = await PatientRecord.countDocuments();
    
    const decryptedRecords = records.map(rec => {
      const obj = rec.toObject();
      if (obj.lifestyleNotes) {
        try {
          obj.lifestyleNotes = decrypt(obj.lifestyleNotes);
        } catch {}
      }
      return obj;
    });
    
    res.json({
      patients: decryptedRecords,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient records' });
  }
});

module.exports = router;
