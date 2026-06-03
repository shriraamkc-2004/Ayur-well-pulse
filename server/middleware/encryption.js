const crypto = require('crypto');
const logger = require('../utils/logger');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

// Fail fast if ENCRYPTION_KEY is not set — never silently fall back to JWT_SECRET
// Using JWT_SECRET as encryption key would couple two unrelated secrets and
// cause silent data corruption if either is rotated independently.
if (!process.env.ENCRYPTION_KEY) {
    logger.warn('⚠️  ENCRYPTION_KEY is not set. Encryption will use a random ephemeral key.');
    logger.warn('   Data encrypted in this session CANNOT be decrypted after restart.');
    logger.warn('   Set ENCRYPTION_KEY in your .env for persistent encryption.');
}

const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT || 'ayurwell-dev-only-salt-CHANGE-IN-PRODUCTION';
if (!process.env.ENCRYPTION_SALT && process.env.NODE_ENV === 'production') {
    logger.error('❌ ENCRYPTION_SALT must be set in production. Using a known salt compromises key derivation.');
    process.exit(1);
}

const secretSource = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const KEY = crypto.scryptSync(secretSource, ENCRYPTION_SALT, 32);

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(text) {
    const [ivHex, authTagHex, encryptedText] = text.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

module.exports = { encrypt, decrypt };
