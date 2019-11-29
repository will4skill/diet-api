const { User, Meal, MealIngredient, Ingredient, sequelize } = require('../../sequelize');
const createJWT = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/meals', () => {
  afterEach(async () => {
    await User.destroy({ where: {} });
    await Meal.destroy({ where: {} });
    await MealIngredient.destroy({ where: {} });
    await Ingredient.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let user, other_user, token, ingredient, meal_1, meal_2, other_user_meal;

    const response = async (jwt) => {
      return await request
        .get('/api/meals')
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: 123456,
        admin: true,
        calories: 2400
      });
      other_user = await User.create({
        username: 'tom',
        email: 'tom@example.com',
        password_digest: 123456,
        admin: false,
        calories: 2000
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

      meal_1 = await Meal.create({
        userId: user.id,
        name: 'Breakfast',
        description: 'Breakfast foods',
      });
      meal_2 = await Meal.create({
        userId: user.id,
        name: 'Lunch',
        description: 'Lunch foods',
      });
      other_user_meal = await Meal.create({
        userId: other_user.id,
        name: 'Brunch',
        description: 'Brunch foods',
      });

      await MealIngredient.bulkCreate([
        {
          mealId: meal_1.id,
          ingredientId: ingredient.id,
          servings: 1
        },
        {
          mealId: meal_2.id,
          ingredientId: ingredient.id,
          servings: 2
        },
        {
          mealId: other_user_meal.id,
          ingredientId: ingredient.id,
          servings: 3
        }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it(`should return all meals and associated meal_ingredients
        for current user only (stat code 200)`, async () => {
      const res = await response(token);

      expect(res.status).toBe(200);

      expect(res.body.some(m => m.id === meal_1.id)).toBeTruthy();
      expect(res.body.some(m => m.id === meal_2.id)).toBeTruthy();
      expect(res.body.some(m => m.id === other_user_meal.id)).toBeFalsy();

      expect(res.body.some(m => m.userId === meal_1.userId)).toBeTruthy();
      expect(res.body.some(m => m.userId === meal_2.userId)).toBeTruthy();
      expect(res.body.some(m => m.userId === other_user_meal.userId)).toBeFalsy();

      expect(res.body.some(m => m.name === meal_1.name)).toBeTruthy();
      expect(res.body.some(m => m.name === meal_2.name)).toBeTruthy();

      expect(res.body.some(m => m.description === meal_1.description)).toBeTruthy();
      expect(res.body.some(m => m.description === meal_2.description)).toBeTruthy();

      expect(res.body.some(m => m.meal_ingredients.length === 1)).toBeTruthy();
      expect(res.body.length).toBe(2);
    });
  });

  describe('POST /', () => {
    let user, other_user, token, meal, meal_object, ingredient,
        meal_ingredient_1, meal_ingredient_2, other_meal_ingredient;

    const response = async (object, jwt) => {
      return await request
        .post('/api/meals')
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: 123456,
        admin: true,
        calories: 2400
      });
      other_user = await User.create({
        username: 'tom',
        email: 'tom@example.com',
        password_digest: 123456,
        admin: false,
        calories: 2000
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

      meal_ingredient_1 = {
        ingredientId: ingredient.id,
        servings: 1
      };
      meal_ingredient_2 = {
        ingredientId: ingredient.id,
        servings: 2
      };
      other_meal_ingredient = {
        ingredientId: ingredient.id,
        servings: 3
      };

      meal_object = {
        userId: user.id,
        name: 'Breakfast',
        description: 'Breakfast foods',
        meal_ingredients: [ meal_ingredient_1, meal_ingredient_2 ]
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(meal_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 400 if meal is invalid', async () => {
      meal_object = {};
      const res = await response(meal_object, token);

      expect(res.status).toBe(400);
    });

    it('should save meal and meal_ingredients if they are valid', async () => {
      const res = await response(meal_object, token);
      const found_m = await Meal.findOne({ where: { userId: meal_object.userId } });
      const mi_1 = await MealIngredient.findOne({ where: { servings: meal_ingredient_1.servings } });
      const mi_2 = await MealIngredient.findOne({ where: { servings: meal_ingredient_2.servings } });

      expect(found_m).toHaveProperty('id');
      expect(found_m).toHaveProperty('userId', meal_object.userId);
      expect(found_m).toHaveProperty('name', meal_object.name);
      expect(found_m).toHaveProperty('description', meal_object.description);

      expect(mi_1).toHaveProperty('mealId', found_m.id);
      expect(mi_1).toHaveProperty('ingredientId', meal_ingredient_1.ingredientId);
      expect(mi_1).toHaveProperty('servings', meal_ingredient_1.servings);

      expect(mi_2).toHaveProperty('mealId', found_m.id);
      expect(mi_2).toHaveProperty('ingredientId', meal_ingredient_2.ingredientId);
      expect(mi_2).toHaveProperty('servings', meal_ingredient_2.servings);
    });

    it('should return meal if meal is valid', async () => {
      const res = await response(meal_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('userId', meal_object.userId);
      expect(res.body).toHaveProperty('name', meal_object.name);
      expect(res.body).toHaveProperty('description', meal_object.description);
    });
  });

  describe('GET /ID', () => {
    let user, other_user, token, ingredient, meal, other_user_meal;

    const response = async (m_id, jwt) => {
      return await request
        .get('/api/meals/' + m_id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: 123456,
        admin: true,
        calories: 2400
      });
      other_user = await User.create({
        username: 'tom',
        email: 'tom@example.com',
        password_digest: 123456,
        admin: false,
        calories: 2000
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

      other_user_meal = await Meal.create({
        userId: other_user.id,
        name: 'Brunch',
        description: 'Brunch foods',
      });

      await MealIngredient.bulkCreate([
        {
          mealId: meal.id,
          ingredientId: ingredient.id,
          servings: 1
        },
        {
          mealId: meal.id,
          ingredientId: ingredient.id,
          servings: 2
        },
        {
          mealId: other_user_meal.id,
          ingredientId: ingredient.id,
          servings: 3
        }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(meal.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not current user', async () => {
      const res = await response(other_user_meal.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid meal ID', async () => {
      const meal_id = 'id';
      const res = await response(meal_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if meal ID valid but meal ID not in DB', async () => {
      const meal_id = '10000';
      const res = await response(meal_id, token);

      expect(res.status).toBe(404);
    });

    it('should return meal and all associated meal_ingredients (stat code 200)', async () => {
      const res = await response(meal.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', meal.id);
      expect(res.body).toHaveProperty('userId', user.id);

      expect(res.body).toHaveProperty('name', meal.name);
      expect(res.body).toHaveProperty('description', meal.description);

      expect(res.body.meal_ingredients.length).toBe(2);
      expect(res.body.meal_ingredients.some(mi => mi.servings === 1)).toBeTruthy();
      expect(res.body.meal_ingredients.some(mi => mi.servings === 2)).toBeTruthy();
      expect(res.body.meal_ingredients.some(mi => mi.servings === 3)).toBeFalsy();
    });
  });

  describe('PUT /ID', () => {
    let user, other_user, token, meal, meal_object, ingredient;

    const response = async (object, m_id, jwt) => {
      return await request
        .put('/api/meals/' + m_id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: 123456,
        admin: true,
        calories: 2400
      });
      other_user = await User.create({
        username: 'tom',
        email: 'tom@example.com',
        password_digest: 123456,
        admin: false,
        calories: 2000
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
      meal_object = {
        name: 'Lunch',
        description: 'Lunch foods',
      }
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(meal_object, meal.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(meal_object, meal.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid meal ID', async () => {
      const meal_id = 'id';
      const res = await response(meal_object, meal_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if meal ID valid but meal ID not in DB', async () => {
      const meal_id = '10000';
      const res = await response(meal_object, meal_id, token);

      expect(res.status).toBe(404);
    });

    // it('should return 400 if meal is invalid', async () => {
    //   meal_object = {};
    //   const res = await response(meal_object, meal.id, token);
    //
    //   expect(res.status).toBe(400);
    // });

    it('should update meal if input is valid', async () => {
      const res = await response(meal_object, meal.id, token);
      const result = await Meal.findOne({ where: { id: meal.id }});

      expect(result).toHaveProperty('id', meal.id);
      expect(result).toHaveProperty('userId', user.id);
      expect(result).toHaveProperty('name', meal_object.name);
      expect(result).toHaveProperty('description', meal_object.description);
    });

    it('should return updated meal if it is valid', async () => {
      const res = await response(meal_object, meal.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', meal.id);
      expect(res.body).toHaveProperty('userId', user.id);
      expect(res.body).toHaveProperty('name', meal_object.name);
      expect(res.body).toHaveProperty('description', meal_object.description);
    });
  });

  describe('DELETE /ID', () => {
    let user, token, ingredient, meal;

    const response = async (m_id, jwt) => {
      return await request
        .delete('/api/meals/' + m_id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: 123456,
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

      await MealIngredient.bulkCreate([
        { mealId: meal.id, ingredientId: ingredient.id, servings: 1 },
        { mealId: meal.id, ingredientId: ingredient.id, servings: 2 }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(meal.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(meal.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid meal ID', async () => {
      const meal_id = 'id';
      const res = await response(meal_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if meal ID valid but meal ID not in DB', async () => {
      const meal_id = '10000';
      const res = await response(meal_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete meal and associated meal_ingredient if input is valid', async () => {
      const res = await response(meal.id, token);
      const returned_meal = await Meal.findOne({ where: { id: meal.id }});
      const returned_meal_ingredients = await MealIngredient.findAll({
        where: { mealId: meal.id }
      });

      expect(returned_meal).toBeNull();
      expect(returned_meal_ingredients).toEqual([]);
    });

    it('should return deleted meal', async () => {
      const res = await response(meal.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', meal.id);
      expect(res.body).toHaveProperty('userId', user.id);
      expect(res.body).toHaveProperty('name', meal.name);
      expect(res.body).toHaveProperty('description', meal.description);
    });
  });
});
