const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g., 'CREATE_RECORD', 'VIEW_HEALTH_LOG', 'UPDATE_CONSENT'
    resourceId: { type: String }, // ID of the resource affected
    resourceType: { type: String }, // e.g., 'PatientRecord', 'HealthLog'
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed } // Additional context
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
