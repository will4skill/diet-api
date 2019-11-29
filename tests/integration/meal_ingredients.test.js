const { User, Meal, MealIngredient, Ingredient, sequelize } = require('../../sequelize');
const createJWT = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/:mealId/meal-ingredients', () => {
  afterEach(async () => {
    await User.destroy({ where: {} });
    await Meal.destroy({ where: {} });
    await MealIngredient.destroy({ where: {} });
    await Ingredient.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('PUT /ID', () => {
    let user, token, ingredient, diet, meal_ingredient, updated_meal_ingredient;

    const response = async (object, jwt, mealId, id) => {
      return await request
        .put(`/api/meals/${mealId}/meal-ingredients/${id}`)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: '123456',
        admin: true,
        calories: 2400
      });
      token = createJWT(user);

      ingredient = await Ingredient.create({
        name: 'Medium Pear',
        description: 'Fruit',
        serving_size: 178.00,
        calories: 101.00,
        carbohydrates: 27.00,
        fat: 65.00,
        protein: 25.00
      });

      ingredient_2 = await Ingredient.create({
        name: 'Bacon',
        description: 'Pork Bacon',
        serving_size: 35.00,
        calories: 161.00,
        carbohydrates: 0.60,
        fat: 12.00,
        protein: 12.00
      });

      meal = await Meal.create({
        userId: user.id,
        name: 'Breakfast',
        description: 'Breakfast foods',
      });

      meal_ingredient = await MealIngredient.create({
        mealId: meal.id,
        ingredientId: ingredient.id,
        servings: 2
      });

      updated_meal_ingredient = {
        ingredientId: ingredient_2.id,
        servings: 3
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(updated_meal_ingredient, token, meal.id, meal_ingredient.id);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(updated_meal_ingredient, token, meal.id, meal_ingredient.id);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid meal_ingredient ID', async () => {
      const meal_ingredient_id = 'id';
      const res = await response(updated_meal_ingredient, token, meal.id, meal_ingredient_id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if meal_ingredient ID valid but meal_ingredient ID not in DB', async () => {
      const meal_ingredient_id = '10000';
      const res = await response(updated_meal_ingredient, token, meal.id, meal_ingredient_id);

      expect(res.status).toBe(404);
    });

    it('should return 400 if invalid meal ID ', async () => {
      const meal_id = 'id';
      const res = await response(updated_meal_ingredient, token, meal_id, meal_ingredient.id);

      expect(res.status).toBe(400);
    });

    it('should return 400 if meal ID valid but meal ID not in DB', async () => {
      const meal_id = '10000';
      const res = await response(updated_meal_ingredient, token, meal_id, meal_ingredient.id);

      expect(res.status).toBe(400);
    });

    // it('should return 400 if meal_ingredient is invalid', async () => {
    //   updated_meal_ingredient = {};
    //   const res = await response(updated_meal_ingredient, token, meal.id, meal_ingredient.id);
    //
    //   expect(res.status).toBe(400);
    // });

    it('should update meal_ingredient if input is valid', async () => {
      const res = await response(updated_meal_ingredient, token, meal.id, meal_ingredient.id);
      const result = await MealIngredient.findOne({ where: { id: meal_ingredient.id }});

      expect(result).toHaveProperty('id', meal_ingredient.id);
      expect(result).toHaveProperty('ingredientId', updated_meal_ingredient.ingredientId);
      expect(result).toHaveProperty('servings', updated_meal_ingredient.servings);
    });

    it('should return updated meal product if it is valid', async () => {
      const res = await response(updated_meal_ingredient, token, meal.id, meal_ingredient.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', meal_ingredient.id);
      expect(res.body).toHaveProperty('ingredientId', updated_meal_ingredient.ingredientId);
      expect(res.body).toHaveProperty('servings', updated_meal_ingredient.servings);
    });
  });

  describe('DELETE /ID', () => {
    let user, token, ingredient, meal, meal_ingredient;

    const response = async (mealId, id, jwt) => {
      return await request
        .delete(`/api/meals/${mealId}/meal-ingredients/${id}`)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: '123456',
        admin: true,
        calories: 2400
      });
      token = createJWT(user);

      ingredient = await Ingredient.create({
        name: 'Medium Pear',
        description: 'Fruit',
        serving_size: 178.00,
        calories: 101.00,
        carbohydrates: 27.00,
        fat: 65.00,
        protein: 25.00
      });

      meal = await Meal.create({
        userId: user.id,
        name: 'Breakfast',
        description: 'Breakfast foods',
      });

      meal_ingredient = await MealIngredient.create({
        mealId: meal.id,
        ingredientId: ingredient.id,
        servings: 2
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(meal.id, meal_ingredient.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(meal.id, meal_ingredient.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if invalid meal ID ', async () => {
      const meal_id = 'id';
      const res = await response(meal_id, meal_ingredient.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if meal ID valid but meal ID not in DB', async () => {
      const meal_id = '10000';
      const res = await response(meal_id, meal_ingredient.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 404 if invalid meal_ingredient ID', async () => {
      const meal_ingredient_id = 'id';
      const res = await response(meal.id, meal_ingredient_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if meal_ingredient ID valid but meal_ingredient ID not in DB', async () => {
      const meal_ingredient_id = '10000';
      const res = await response(meal.id, meal_ingredient_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete meal_ingredient if input is valid', async () => {
      const res = await response(meal.id, meal_ingredient.id, token);
      const result = await MealIngredient.findOne({ where: { id: meal_ingredient.id }});

      expect(result).toBeNull();
    });

    it('should return deleted meal_ingredient', async () => {
      const res = await response(meal.id, meal_ingredient.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', meal_ingredient.id);
      expect(res.body).toHaveProperty('mealId', meal_ingredient.mealId);
      expect(res.body).toHaveProperty('ingredientId', meal_ingredient.ingredientId);
      expect(res.body).toHaveProperty('servings', meal_ingredient.servings);
    });
  });
});
