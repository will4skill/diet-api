const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Meal, MealIngredient, sequelize } = require('../sequelize');

router.get('/', auth, async (req, res) => {
  const meals = await Meal.findAll({
    where: { userId: req.user.id},
    include: [{
      model: MealIngredient,
      required: false
    }]
  });
  res.send(meals);
});

router.post('/', auth, async (req, res) => {
  let meal_ingredients = [];
  try {
    let meal = await Meal.create({
      name: req.body.name,
      description: req.body.description,
    });
    for(let mi of req.body.meal_ingredients) {
      meal_ingredients.push({
        mealId: meal.id,
        ingredientId: mi.ingredientId,
        servings: mi.servings
      });
    }
    // Note: tried to use a transaction here. Didn't work
    await MealIngredient.bulkCreate(meal_ingredients);
    res.send(meal);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.get('/:id', auth, async (req, res) => {
  const meal = await Meal.findOne({
    where: { id: req.params.id },
    include: {
      model: MealIngredient,
      where: { mealId: req.params.id },
      required: false
    }
  });

  if (!meal) {
    res.status(404).send('Meal with submitted ID not found');
  } else { // Check for current user
    if (req.user.id !== meal.userId) {
      res.status(403).send('Forbidden');
    } else {
      res.send(meal);
    }
  }
});

router.put('/:id', [auth, admin], async (req, res) => {
  let meal = await Meal.findOne({ where: { id: req.params.id } });
  if (!meal) {
    return res.status(404).send('Meal with submitted ID not found');
  }

  try {
    const updated_meal = await meal.update({
      name: req.body.name,
      description: req.body.description,
    });
    res.send(updated_meal);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const meal = await Meal.findOne({ where: { id: req.params.id } });
  if (!meal) {
    res.status(404).send('Meal ID not found');
  } else {
    await meal.destroy(); // Auto-deletes meal_ingredients
    res.send(meal);
  }
});

module.exports = router;
