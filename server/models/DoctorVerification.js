const mongoose = require('mongoose');

const doctorVerificationSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    registrationNumber: { type: String, required: true, unique: true },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    certificateUrl: { type: String },
    govtIdUrl: { type: String },
    blockchainHash: { type: String },
    verifiedAt: { type: Date }
}, { timestamps: true }); // Mongoose manages createdAt/updatedAt automatically

module.exports = mongoose.model('DoctorVerification', doctorVerificationSchema);
