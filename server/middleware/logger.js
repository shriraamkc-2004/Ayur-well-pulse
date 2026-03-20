const AuditLog = require('../models/AuditLog');

async function logEvent(userId, action, resourceId, resourceType, details = {}, req = {}) {
    try {
        const log = new AuditLog({
            userId,
            action,
            resourceId,
            resourceType,
            ipAddress: req.ip || 'unknown',
            userAgent: req.headers ? req.headers['user-agent'] : 'unknown',
            details
        });
        await log.save();
    } catch (err) {
        console.error('Audit Log Error:', err);
    }
}

module.exports = { logEvent };
