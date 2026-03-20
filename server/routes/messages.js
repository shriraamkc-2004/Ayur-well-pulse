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

        const encryptedContent = encrypt(content);

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
        res.status(500).json({ error: error.message });
    }
});

// @route   GET api/messages/:userId
// @desc    Get conversation with a specific user
router.get('/:userId', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user.id }
            ]
        }).sort({ timestamp: 1 });

        const decryptedMessages = messages.map(msg => {
            const obj = msg.toObject();
            obj.content = decrypt(obj.content);
            return obj;
        });

        res.json(decryptedMessages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
