const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');

// @route   GET api/foods
// @desc    Get all food items or search by name
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        const foods = await FoodItem.find(query);
        res.json(foods);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   GET api/foods/:id
// @desc    Get food item by ID
router.get('/:id', async (req, res) => {
    try {
        const food = await FoodItem.findById(req.params.id);
        if (!food) return res.status(404).json({ error: 'Food item not found' });
        res.json(food);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
