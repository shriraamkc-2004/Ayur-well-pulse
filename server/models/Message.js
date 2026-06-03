const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true }, // Encrypted at-rest
    read: { type: Boolean, default: false },
    attachments: [{
        fileUrl: String,
        fileName: String,
        fileType: String
    }],
    timestamp: { type: Date, default: Date.now }
});

// Compound index for efficient conversation queries
messageSchema.index({ sender: 1, receiver: 1, timestamp: 1 });

module.exports = mongoose.model('Message', messageSchema);
