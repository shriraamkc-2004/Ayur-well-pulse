const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String },
    role: {
        type: String,
        enum: ['patient', 'dietitian', 'doctor', 'admin'],
        default: 'patient'
    },
    avatarUrl: { type: String },
    phoneNumber: { type: String }
}, { timestamps: true }); // Mongoose manages createdAt and updatedAt automatically

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
});

userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
