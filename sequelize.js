const config = require('config');
const db = config.get('db');
let sequelize;
const Sequelize = require('sequelize');

// Import model definitions
const DietModel = require('./models/diet');
const IngredientModel = require('./models/ingredient');
const MealIngredientModel = require('./models/meal_ingredient');
const MealModel = require('./models/meal');
const UserModel = require('./models/user');

// Create sequelize instance
if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres'
  });
} else {
  sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: db
  });
}

// Use sequelize instance and Sequelize constructor to create model classes
const Diet = DietModel(sequelize, Sequelize);
const Ingredient = IngredientModel(sequelize, Sequelize);
const MealIngredient = MealIngredientModel(sequelize, Sequelize);
const Meal = MealModel(sequelize, Sequelize);
const User = UserModel(sequelize, Sequelize);

// Create associations between models
User.hasMany(Meal, { foreignKey: {allowNull: false }});
Meal.hasMany(MealIngredient, {
  foreignKey: { allowNull: false },
  onDelete: 'cascade'
});
MealIngredient.belongsTo(Ingredient, { foreignKey: { allowNull: false }});
User.belongsTo(Diet); // dietId can be null

// Create database tables
sequelize.sync().then(() => {
  console.log("Database and tables created");
});

module.exports = {
  User,
  Diet,
  Ingredient,
  MealIngredient,
  Meal,
  User,
  sequelize
};
