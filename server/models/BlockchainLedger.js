const mongoose = require('mongoose');

const blockchainLedgerSchema = new mongoose.Schema({
    transactionHash: { type: String, required: true, unique: true },
    resourceId: { type: String, required: true },
    resourceType: { type: String, required: true }, // e.g., 'DoctorVerification', 'Prescription'
    dataHash: { type: String, required: true }, // SHA-256 hash of the resource data
    timestamp: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('BlockchainLedger', blockchainLedgerSchema);
