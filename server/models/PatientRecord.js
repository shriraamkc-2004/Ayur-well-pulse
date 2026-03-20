const mongoose = require('mongoose');

const patientRecordSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateOfBirth: { type: Date },
    gender: { type: String },
    doshaProfile: {
        vata: { type: Number },
        pitta: { type: Number },
        kapha: { type: Number }
    },
    allergies: [{ type: String }],
    conditions: [{ type: String }],
    lifestyleNotes: { type: String },
    encryptedMetadata: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PatientRecord', patientRecordSchema);
