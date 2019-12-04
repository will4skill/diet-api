const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Diet } = require('../sequelize');

router.get('/', async (req, res) => {
  const diets = await Diet.findAll();
  res.send(diets);
});

router.get('/:id', [auth, admin], async (req, res) => {
  const diet = await Diet.findOne({ where: { id: req.params.id }});
  if (!diet) {
    return res.status(404).send('Diet with submitted ID not found');
  }
  res.send(diet);
});

router.post('/', [auth, admin], async (req, res) => {
  try {
    const diet = await Diet.create({
      name: req.body.name,
      description: req.body.description,
      calories: req.body.calories,
      protein: req.body.protein,
      fat: req.body.fat,
      carbohydrates: req.body.carbohydrates
    });
    res.send(diet);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put('/:id', [auth, admin], async (req, res) => {
  const diet = await Diet.findOne({ where: { id: req.params.id }});
  if (!diet) {
    return res.status(404).send('Diet with submitted ID not found');
  }
  try {
    const updated_diet = await diet.update({
      name: req.body.name,
      description: req.body.description,
      calories: req.body.calories,
      protein: req.body.protein,
      fat: req.body.fat,
      carbohydrates: req.body.carbohydrates
    });
    res.send(updated_diet);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const diet = await Diet.findOne({ where: { id: req.params.id }});
  if (!diet) {
    return res.status(404).send('Diet with submitted ID not found');
  }
  await diet.destroy();
  res.send(diet);
});

module.exports = router;
