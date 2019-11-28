const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { findMeal} = require('../middleware/find');
const { Meal, MealIngredient } = require('../sequelize');
const prefix = '/:mealId/meal-ingredients';

router.put(`${prefix}/:id`, [auth, admin, findMeal], async (req, res) => {
  const meal_ingredient = await MealIngredient.findOne({ where: { id: req.params.id } });
  if (!meal_ingredient) {
    return res.status(404).send('Meal ingredient with submitted ID not found');
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

router.delete(`${prefix}/:id`, [auth, admin, findMeal], async (req, res) => {
  const meal_ingredient = await MealIngredient.findOne({ where: { id: req.params.id }});
  if (!meal_ingredient) {
    return res.status(404).send('Meal ingredient with submitted ID not found');
  }
  await meal_ingredient.destroy();
  res.send(meal_ingredient);
});

module.exports = router;
