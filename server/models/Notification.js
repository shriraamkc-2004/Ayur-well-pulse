const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['reminder', 'tip', 'alert', 'system'], default: 'reminder' },
    status: { type: String, enum: ['unread', 'read'], default: 'unread' },
    scheduledFor: { type: Date },
    sentAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('Notification', notificationSchema);
