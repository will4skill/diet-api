const { Meal, Diet } = require('../sequelize');

async function findMeal(req, res, next) {
  const meal = await Meal.findOne({ where: { id: req.params.mealId }});
  if (!meal) {
    return res.status(400).send('Invalid Meal');
  }
  req.meal = meal;
  next();
}

async function findDiet(req, res, next) {
  const diet = await Diet.findOne({ where: { id: req.body.dietId }});
  if (!diet) {
    return res.status(400).send('Invalid Diet');
  }
  req.diet = diet;
  next();
}

module.exports = {
  findMeal,
  findDiet
};
