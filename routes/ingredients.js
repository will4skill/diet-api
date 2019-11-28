const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Ingredient } = require('../sequelize');

router.get('/', auth, async (req, res) => {
  const ingredients = await Ingredient.findAll();
  res.send(ingredients);
});

router.get('/:id', [auth, admin], async (req, res) => {
  const ingredient = await Ingredient.findOne({ where: { id: req.params.id }});
  if (!ingredient) {
    return res.status(404).send('Ingredient with submitted ID not found');
  }
  res.send(ingredient);
});

router.post('/', [auth, admin], async (req, res) => {
  try {
    const ingredient = await Ingredient.create({
      name: req.body.name,
      description: req.body.text,
      servering_size: req.body.serving_size,
      calories: req.body.calories,
      protein: req.body.protein,
      fat: req.body.fat,
      carbohydrates: req.body.carbohydrates
    });
    res.send(ingredient);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put('/:id', [auth, admin], async (req, res) => {
  const ingredient = await Ingredient.findOne({ where: { id: req.params.id }});
  if (!ingredient) {
    return res.status(404).send('Ingredient with submitted ID not found');
  }
  try {
    const updated_ingredient = await ingredient.update({
      name: req.body.name,
      description: req.body.text,
      servering_size: req.body.serving_size,
      calories: req.body.calories,
      protein: req.body.protein,
      fat: req.body.fat,
      carbohydrates: req.body.carbohydrates
    });
    res.send(updated_ingredient);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const ingredient = await Ingredient.findOne({ where: { id: req.params.id }});
  if (!ingredient) {
    return res.status(404).send('Ingredient with submitted ID not found');
  }
  await ingredient.destroy();
  res.send(ingredient);
});

module.exports = router;
