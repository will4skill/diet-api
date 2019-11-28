const { Meal } = require('../sequelize');

async function findMeal(req, res, next) {
  const meal = await Meal.findOne({ where: { id: req.params.mealId }});
  if (!meal) {
    return res.status(400).send('Invalid Meal');
  }
  req.meal = meal;
  next();
}

module.exports = {
  findMeal,
};
