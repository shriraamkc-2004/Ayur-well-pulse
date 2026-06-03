const crypto = require('crypto');
const BlockchainLedger = require('../models/BlockchainLedger');
const logger = require('../utils/logger');

function generateHash(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

async function commitToBlockchain(resourceId, resourceType, data) {
    try {
        const dataHash = generateHash(data);
        const transactionHash = crypto.randomBytes(32).toString('hex');

        const entry = new BlockchainLedger({
            transactionHash,
            resourceId,
            resourceType,
            dataHash
        });

        await entry.save();
        return transactionHash;
    } catch (err) {
        logger.error('Blockchain Commit Error:', err);
        return null;
    }
}

module.exports = { generateHash, commitToBlockchain };
