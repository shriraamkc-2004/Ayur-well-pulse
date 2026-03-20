/**
 * AI Microservice Stub
 * In production this would proxy to Python/Flask containers for:
 *  - Food Image Recognition (Computer Vision)
 *  - NLP for Voice-to-Diet-Log
 *  - Nutrient Analysis
 */

const FoodItem = require('../models/FoodItem');

/**
 * Parse meal text using keyword matching against the food database.
 * Simulates the NLP pipeline described in system_architecture.md §2.1.
 */
async function parseTextToMeals(text) {
    const foods = await FoodItem.find({});
    const matchedFoods = [];
    foods.forEach(food => {
        const keyword = food.name.toLowerCase().split('(')[0].trim();
        if (text.toLowerCase().includes(keyword)) {
            matchedFoods.push(food);
        }
    });
    return matchedFoods;
}

/**
 * Generate a rule-based Ayurvedic diet plan based on the patient's dosha profile.
 * Simulates the Nutrient Analysis engine described in system_architecture.md §2.1.
 */
async function generateDietPlanForPatient(patientRecord) {
    const dominantDosha = getDominantDosha(patientRecord?.doshaProfile);
    const foods = await FoodItem.find({});

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const themes = {
        vata: 'Grounding & Nourishing',
        pitta: 'Cooling & Calming',
        kapha: 'Light & Energizing',
        balanced: 'Balanced Wellness Week'
    };

    const weeklyPlan = dayNames.map(day => {
        const shuffled = [...foods].sort(() => 0.5 - Math.random());
        return {
            day,
            breakfast: shuffled[0]?._id || null,
            lunch: shuffled[1]?._id || null,
            dinner: shuffled[2]?._id || null,
            snacks: shuffled.slice(3, 5).map(f => f._id)
        };
    });

    return {
        title: `${themes[dominantDosha]} Plan`,
        theme: themes[dominantDosha],
        ayurvedicAdvice: getAdviceForDosha(dominantDosha),
        weeklyPlan
    };
}

function getDominantDosha(profile) {
    if (!profile) return 'balanced';
    const { vata = 0, pitta = 0, kapha = 0 } = profile;
    if (vata >= pitta && vata >= kapha) return 'vata';
    if (pitta >= vata && pitta >= kapha) return 'pitta';
    return 'kapha';
}

function getAdviceForDosha(dosha) {
    const advice = {
        vata: 'Favor warm, oily, and heavy foods. Eat at regular times. Reduce raw vegetables.',
        pitta: 'Favor cool, slightly dry foods. Avoid spicy and fermented items. Eat calmly.',
        kapha: 'Favor light, dry, and warm foods. Avoid heavy dairy. Exercise before meals.',
        balanced: 'Maintain a diverse, seasonal diet. Eat mindfully and in moderate quantities.'
    };
    return advice[dosha] || advice.balanced;
}

module.exports = { parseTextToMeals, generateDietPlanForPatient };
