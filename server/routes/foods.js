const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');

// Escape regex special characters to prevent ReDoS attacks
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// @route   GET api/foods/search
// @desc    Search food items by query string
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') return res.json([]);
        // Sanitize and limit query length to prevent abuse
        const sanitizedQuery = escapeRegex(q.trim().substring(0, 100));
        const foods = await FoodItem.find({
            name: { $regex: sanitizedQuery, $options: 'i' }
        }).limit(20);
        res.json(foods);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search foods' });
    }
});

// @route   GET api/foods
// @desc    Get all food items or search by name
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search && typeof search === 'string') {
            const sanitizedSearch = escapeRegex(search.trim().substring(0, 100));
            query.name = { $regex: sanitizedSearch, $options: 'i' };
        }
        const foods = await FoodItem.find(query).limit(100);
        res.json(foods);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch foods' });
    }
});

// @route   GET api/foods/:id
// @desc    Get food item by ID
router.get('/:id', async (req, res) => {
    try {
        // Validate ObjectId format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid food item ID' });
        }
        const food = await FoodItem.findById(req.params.id);
        if (!food) return res.status(404).json({ error: 'Food item not found' });
        res.json(food);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch food item' });
    }
});

module.exports = router;
