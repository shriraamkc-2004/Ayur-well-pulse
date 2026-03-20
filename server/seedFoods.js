const mongoose = require('mongoose');
const FoodItem = require('./models/FoodItem');
require('dotenv').config();

const foods = [
    {
        name: "Moong Dal (Mung Bean)",
        nutrients: { calories: 347, protein: 24, carbs: 63, fat: 1, fiber: 16 },
        ayurvedicAttributes: {
            rasa: ["Sweet", "Astringent"],
            virya: "Cooling",
            vipaka: "Sweet",
            guna: ["Light", "Soft"],
            doshaEffect: { vata: "decrease", pitta: "decrease", kapha: "decrease" }
        },
        bestSeason: ["All"],
        description: "One of the most cherished foods in Ayurveda, easy to digest and balances all three doshas."
    },
    {
        name: "Pomegranate",
        nutrients: { calories: 83, protein: 1.7, carbs: 19, fat: 1.2, fiber: 4 },
        ayurvedicAttributes: {
            rasa: ["Sweet", "Sour", "Astringent"],
            virya: "Heating",
            vipaka: "Sweet",
            guna: ["Light", "Oily"],
            doshaEffect: { vata: "decrease", pitta: "decrease", kapha: "decrease" }
        },
        bestSeason: ["Autumn", "Winter"],
        description: "A powerhouse of antioxidants, excellent for blood and heart health."
    },
    {
        name: "Basmati Rice",
        nutrients: { calories: 350, protein: 7, carbs: 78, fat: 0.5, fiber: 1 },
        ayurvedicAttributes: {
            rasa: ["Sweet"],
            virya: "Cooling",
            vipaka: "Sweet",
            guna: ["Light", "Soft"],
            doshaEffect: { vata: "decrease", pitta: "decrease", kapha: "neutral" }
        },
        bestSeason: ["All"],
        description: "Considered the 'King of Rice' in Ayurveda, easy on the stomach and provides sustained energy."
    },
    {
        name: "Ginger (Fresh)",
        nutrients: { calories: 80, protein: 1.8, carbs: 18, fat: 0.8, fiber: 2 },
        ayurvedicAttributes: {
            rasa: ["Pungent"],
            virya: "Heating",
            vipaka: "Sweet",
            guna: ["Heavy", "Dry"],
            doshaEffect: { vata: "decrease", pitta: "neutral", kapha: "decrease" }
        },
        bestSeason: ["Winter", "Rainy"],
        description: "The 'Universal Medicine' (Vishwabheshaja), excellent for digestion and clearing toxins."
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ayurwell');
        console.log('Connected to MongoDB for seeding...');

        await FoodItem.deleteMany({}); // Clear existing
        await FoodItem.insertMany(foods);

        console.log('Food database seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
}

seed();
