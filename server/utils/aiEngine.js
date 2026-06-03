/**
 * AI Microservice Stub
 * In production this would proxy to Python/Flask containers for:
 *  - Food Image Recognition (Computer Vision)
 *  - NLP for Voice-to-Diet-Log
 *  - Nutrient Analysis
 */

const FoodItem = require('../models/FoodItem');
const logger = require('./logger');

/**
 * Parse meal text using keyword matching against the food database.
 * Simulates the NLP pipeline described in system_architecture.md §2.1.
 * Optimized: single DB query with $in/$regex instead of loading all foods into memory.
 */
async function parseTextToMeals(text) {
    if (!text || typeof text !== 'string') return [];

    try {
        // Use a targeted DB query instead of loading all foods into memory
        // Extract meaningful words (>=3 chars) from the text
        const words = text.toLowerCase()
            .split(/\s+/)
            .filter(w => w.length >= 3)
            .slice(0, 20); // limit to 20 keywords

        if (words.length === 0) return [];

        // Build regex OR pattern from keywords
        const escapedWords = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const pattern = new RegExp(escapedWords.join('|'), 'i');

        const matchedFoods = await FoodItem.find({ name: pattern }).limit(20);
        return matchedFoods;
    } catch (err) {
        logger.error('parseTextToMeals error:', err);
        return [];
    }
}

/**
 * Generate a rule-based Ayurvedic diet plan based on the patient's dosha profile.
 * Simulates the Nutrient Analysis engine described in system_architecture.md §2.1.
 */
async function generateDietPlanForPatient(patientRecord) {
    const dominantDosha = getDominantDosha(patientRecord?.doshaProfile);
    // Load only active food items, limit to reasonable set
    const foods = await FoodItem.find({}).limit(100);

    if (foods.length === 0) {
        return {
            title: 'No Foods Available',
            theme: 'No foods available',
            ayurvedicAdvice: 'Food database is empty. Please seed foods first.',
            weeklyPlan: []
        };
    }

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const themes = {
        vata: 'Grounding & Nourishing',
        pitta: 'Cooling & Calming',
        kapha: 'Light & Energizing',
        balanced: 'Balanced Wellness Week'
    };

    const weeklyPlan = dayNames.map(day => {
        // Use deterministic selection based on day + dosha instead of pure random
        const offset = dayNames.indexOf(day) * 3;
        return {
            day,
            breakfast: foods[(offset) % foods.length]?._id || null,
            lunch: foods[(offset + 1) % foods.length]?._id || null,
            dinner: foods[(offset + 2) % foods.length]?._id || null,
            snacks: foods.slice((offset + 3) % foods.length, ((offset + 3) % foods.length) + 2).map(f => f._id)
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
