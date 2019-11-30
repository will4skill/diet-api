const {   User,
          Diet,
          Ingredient,
          Meal,
          MealIngredient,
          sequelize } = require('./sequelize');
const bcrypt = require('bcrypt');
const config = require('config');

(async () => {
  try {
    await sequelize.sync({force: true}); // Reset database
    const salt_value = Number(config.get("bcrypt_salt"));
    const salt = await bcrypt.genSalt(salt_value);
    const password_digest = await bcrypt.hash("123456", salt);

    // Create Admin User
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password_digest: '123456',
      calories: 3000,
      admin: true
    });
    // User
    const user = await User.create({
      username: 'bob',
      email: 'bob@example.com',
      password_digest: 123456,
      admin: true,
      calories: 2400
    });
    // Other user
    const other_user = await User.create({
      username: 'tom',
      email: 'tom@example.com',
      password_digest: 123456,
      admin: false,
      calories: 2000
    });

    // Create Diets
    const keto = await Diet.create({
      name: 'Keto',
      description: 'Low-carb, high-fat',
      carbohydrates: 10.00,
      fat: 65.00,
      protein: 25.00
    });

    const balanced = await Diet.create({
      name: 'Balanced',
      description: 'Balanced macro distribution',
      carbohydrates: 50.00,
      fat: 20.00,
      protein: 30.00
    });

    // Orders
    const meal_1 = await Meal.create({
      userId: user.id,
      name: 'Breakfast',
      description: 'Breakfast foods',
    });
    const meal_2 = await Meal.create({
      userId: user.id,
      name: 'Lunch',
      description: 'Lunch foods',
    });

    const ingredient_1 = await Ingredient.create({
      name: "Broccoli",
      description: "1 Stalk",
      serving_size: 151, //g
      calories: 51, //g
      protein: 4.3, //g
      fat: 0.6, //g
      carbohydrates: 10, //g
    });
    const ingredient_2 = await Ingredient.create({
      name: "Avocado",
      description: "1 cup, sliced",
      serving_size: 146,
      calories: 234,
      protein: 2.9,
      fat: 21,
      carbohydrates: 12
    });
    const ingredient_3 = await Ingredient.create({
      name: "Bread, White",
      description: "1 large slice",
      serving_size: 30,
      calories: 79,
      protein: 2.7,
      fat: 1,
      carbohydrates: 15
    });
    const ingredient_4 = await Ingredient.create({
      name: "Bacon",
      description: "1 cooked slice",
      serving_size: 8,
      calories: 43,
      protein: 3,
      fat: 3.3,
      carbohydrates: 0.1
    });

    await Ingredient.bulkCreate([
      {
        name: "Pizza",
        description: "1 slice",
        serving_size: 100,
        calories: 266,
        protein: 11,
        fat: 10,
        carbohydrates: 33
      },
      {
        name: "Chicken Breast",
        description: "100g of chicken breast",
        serving_size: 100,
        calories: 165,
        protein: 31,
        fat: 3.6,
        carbohydrates: 0
      },
      {
        name: "Cheeseburger",
        description: "Cheeseburger, single patty",
        serving_size: 100,
        calories: 303,
        protein: 15,
        fat: 14,
        carbohydrates: 30
      },
      {
        name: "Hot Dog",
        description: "1 hot dog",
        serving_size: 52,
        calories: 151,
        protein: 5,
        fat: 13,
        carbohydrates: 2.2
      },
      {
        name: "Ice Cream",
        description: "1 serving 1/2 cup",
        serving_size: 66,
        calories: 137,
        protein: 2.3,
        fat: 7,
        carbohydrates: 16
      },
      {
        name: "Chocolate Chip Cookie",
        description: "1 homemade chocolate chip cookie",
        serving_size: 16,
        calories: 78,
        protein: 0.9,
        fat: 4.5,
        carbohydrates: 9
      },
      {
        name: "Chocolate Doughnut",
        description: "1 doughnut",
        serving_size: 43,
        calories: 195,
        protein: 2.1,
        fat: 11,
        carbohydrates: 22
      },
      {
        name: "French Fries",
        description: "1 serving",
        serving_size: 117,
        calories: 365,
        protein: 4,
        fat: 17,
        carbohydrates: 48
      },
      {
        name: "Cupcake",
        description: "1 cupcake",
        serving_size: 43,
        calories: 131,
        protein: 1.8,
        fat: 1.6,
        carbohydrates: 29
      },
      {
        name: "Apple Pie",
        description: "1 serving",
        serving_size: 100,
        calories: 237,
        protein: 1.9,
        fat: 11,
        carbohydrates: 34
      },
      {
        name: "Rice",
        description: "white, long-grain, cooked",
        serving_size: 158,
        calories: 206,
        protein: 4.3,
        fat: 0.5,
        carbohydrates: 45
      },
      {
        name: "Taco",
        description: "1 taco, hard, with beef, cheese and lettuce",
        serving_size: 69,
        calories: 156,
        protein: 6,
        fat: 9,
        carbohydrates: 14
      },
      {
        name: "Salad",
        description: "1 McDonald's Caesar Salad",
        serving_size: 213,
        calories: 94,
        protein: 7,
        fat: 4.4,
        carbohydrates: 9
      },
      {
        name: "Corn on the cob",
        description: "1 ear",
        serving_size: 146,
        calories: 155,
        protein: 4.5,
        fat: 3.4,
        carbohydrates: 32
      }
    ]);

    // Meal Ingredient
    await MealIngredient.bulkCreate([
      { mealId: meal_1.id, ingredientId: ingredient_1.id, servings: 2 },
      { mealId: meal_1.id, ingredientId: ingredient_2.id, servings: 1 },
      { mealId: meal_1.id, ingredientId: ingredient_3.id, servings: 2 },
      { mealId: meal_2.id, ingredientId: ingredient_1.id, servings: 3 },
      { mealId: meal_2.id, ingredientId: ingredient_4.id, servings: 4 },
    ]);

    console.log("Success!");
  } catch(err) {
    console.log("ERROR! Try Again!");
    console.log("Error info: " + err);
  }

  await sequelize.close();
})();
