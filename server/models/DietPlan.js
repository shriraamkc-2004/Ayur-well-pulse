const mongoose = require('mongoose');

const dayPlanSchema = new mongoose.Schema({
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
    lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
    dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
    snacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' }]
});

const dietPlanSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    theme: { type: String }, // e.g., 'Cooling Week', 'Immunity Boost'
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: { type: String, enum: ['active', 'past', 'future'], default: 'active' },
    weeklyPlan: [dayPlanSchema],
    ayurvedicAdvice: { type: String }
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);
