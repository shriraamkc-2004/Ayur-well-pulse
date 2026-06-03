const mongoose = require('mongoose');

const mealLogSchema = new mongoose.Schema({
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
    foodName: { type: String },
    portion: { type: String }, // e.g., '1 bowl', '200g'
    time: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
    nutrients: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number
    }
});

const healthLogSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    vitals: {
        weight: Number,
        bloodPressure: String,
        temperature: Number,
        heartRate: Number
    },
    symptoms: [{ type: String }],
    mood: { type: String },
    digestion: { type: String },
    energyLevel: { type: Number, min: 1, max: 10 },
    meals: [mealLogSchema],
    waterIntake: { type: Number }, // in ml
    notes: { type: String }
}, { timestamps: true }); // Mongoose manages createdAt/updatedAt automatically

module.exports = mongoose.model('HealthLog', healthLogSchema);
