const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    nutrients: {
        calories: { type: Number },
        protein: { type: Number },
        carbs: { type: Number },
        fat: { type: Number },
        fiber: { type: Number }
    },
    ayurvedicAttributes: {
        rasa: [{ type: String }], // Taste: Sweet, Sour, Salty, Pungent, Bitter, Astringent
        virya: { type: String }, // Potency: Heating, Cooling
        vipaka: { type: String }, // Post-digestive effect: Sweet, Sour, Pungent
        guna: [{ type: String }], // Qualities: Heavy, Light, Oily, Dry, etc.
        doshaEffect: {
            vata: { type: String, enum: ['increase', 'decrease', 'neutral'] },
            pitta: { type: String, enum: ['increase', 'decrease', 'neutral'] },
            kapha: { type: String, enum: ['increase', 'decrease', 'neutral'] }
        }
    },
    bestSeason: [{ type: String }],
    description: { type: String },
    imageUrl: { type: String }
});

module.exports = mongoose.model('FoodItem', foodItemSchema);
