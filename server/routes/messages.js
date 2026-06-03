const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const { encrypt, decrypt } = require('../middleware/encryption');
const { logEvent } = require('../middleware/logger');

// @route   POST api/messages
// @desc    Send a message
router.post('/', auth, async (req, res) => {
    try {
        const { receiver, content, attachments } = req.body;

        if (!receiver || !content || typeof content !== 'string') {
            return res.status(400).json({ error: 'Receiver and content are required' });
        }

        const encryptedContent = encrypt(content.trim().substring(0, 5000));

        const message = new Message({
            sender: req.user.id,
            receiver,
            content: encryptedContent,
            attachments
        });

        await message.save();
        await logEvent(req.user.id, 'SEND_MESSAGE', message.id, 'Message', { receiver }, req);
        res.json({ ...message.toObject(), content }); // Return unencrypted
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// @route   GET api/messages/:userId
// @desc    Get conversation with a specific user (paginated)
router.get('/:userId', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const skip = (page - 1) * limit;

        const filter = {
            $or: [
                { sender: req.user.id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user.id }
            ]
        };

        const [messages, total] = await Promise.all([
            Message.find(filter).sort({ timestamp: 1 }).skip(skip).limit(limit),
            Message.countDocuments(filter)
        ]);

        const decryptedMessages = messages.map(msg => {
            const obj = msg.toObject();
            try {
                obj.content = decrypt(obj.content);
            } catch {
                obj.content = '[Decryption failed]';
            }
            return obj;
        });

        res.json({
            messages: decryptedMessages,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

module.exports = router;
