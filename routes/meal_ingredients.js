const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { findMeal} = require('../middleware/find');
const { Meal, MealIngredient } = require('../sequelize');
const prefix = '/:mealId/meal-ingredients';

router.get(`${prefix}/:id`, [auth, findMeal], async (req, res) => {
  if (req.user.id !== req.meal.userId) return res.status(403).send('Forbidden');

  const meal_ingredient = await MealIngredient.findOne({ where: { id: req.params.id }});
  if (!meal_ingredient) {
    res.status(404).send('Meal ingredient with submitted ID not found');
  } else {
    res.send(meal_ingredient);
  }
});

router.post(`${prefix}/`, [auth, findMeal], async (req, res) => {
  try {
    const meal_ingredient = await MealIngredient.create({
      mealId: req.meal.id,
      ingredientId: req.body.ingredientId,
      servings: req.body.servings
    });
    res.send(meal_ingredient);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.put(`${prefix}/:id`, [auth, findMeal], async (req, res) => {
  const meal_ingredient = await MealIngredient.findOne({ where: { id: req.params.id } });
  if (!meal_ingredient) {
    return res.status(404).send('Meal ingredient with submitted ID not found');
  } else if (req.user.id !== req.meal.userId) {
    return res.status(403).send('Forbidden');
  }

  try {
    const updated_meal_ingredient = await meal_ingredient.update({
      mealId: req.meal.id,
      ingredientId: req.body.ingredientId,
      servings: req.body.servings
    });
    res.send(updated_meal_ingredient);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete(`${prefix}/:id`, [auth, findMeal], async (req, res) => {
  const meal_ingredient = await MealIngredient.findOne({ where: { id: req.params.id }});
  if (!meal_ingredient) {
    return res.status(404).send('Meal ingredient with submitted ID not found');
  } else if (req.user.id !== req.meal.userId) {
    return res.status(403).send('Forbidden');
  } else {
    await meal_ingredient.destroy();
    res.send(meal_ingredient);
  }
});

module.exports = router;
