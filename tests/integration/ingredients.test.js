const { Ingredient, User, sequelize } = require('../../sequelize');
const createJWT = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/ingredients', () => {
  afterEach(async () => {
    await Ingredient.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let token;

    const response = async (jwt) => {
      return await request
        .get('/api/ingredients')
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      const user = User.build({ admin: false });
      token = createJWT(user);
      await Ingredient.bulkCreate([
        {
          name: 'Medium Pear',
          description: 'Fruit',
          serving_size: 178.00,
          calories: 101.00,
          carbohydrates: 27.00,
          fat: 65.00,
          protein: 25.00
        },
        {
          name: 'Bacon',
          description: 'Pork Bacon',
          serving_size: 35.00,
          calories: 161.00,
          carbohydrates: 0.60,
          fat: 12.00,
          protein: 12.00
        }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it('should return all ingredients (stat code 200)', async () => {
      const res = await response(token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(m => m.name === 'Medium Pear')).toBeTruthy();
      expect(res.body.some(m => m.name === 'Bacon')).toBeTruthy();
      expect(res.body.some(m => m.description === 'Fruit')).toBeTruthy();
      expect(res.body.some(m => m.description === 'Pork Bacon')).toBeTruthy();
      expect(res.body.some(m => m.serving_size === 178.00)).toBeTruthy();
      expect(res.body.some(m => m.serving_size === 35.00)).toBeTruthy();
      expect(res.body.some(m => m.calories === 101.00)).toBeTruthy();
      expect(res.body.some(m => m.calories === 161.00)).toBeTruthy();
      expect(res.body.some(m => m.carbohydrates === 27.00)).toBeTruthy();
      expect(res.body.some(m => m.carbohydrates === 0.60)).toBeTruthy();
      expect(res.body.some(m => m.fat === 65.00)).toBeTruthy();
      expect(res.body.some(m => m.fat === 12.00)).toBeTruthy();
      expect(res.body.some(m => m.protein === 25.00)).toBeTruthy();
      expect(res.body.some(m => m.protein === 12.00)).toBeTruthy();
    });
  });

  describe('GET /ID', () => {
    let user, token, ingredient;

    const response = async (id, jwt) => {
      return await request
        .get(`/api/ingredients/${id}`)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
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
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(ingredient.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(ingredient.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid ingredient ID', async () => {
      const ingredient_id = 'id';
      const res = await response(ingredient_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if ingredient ID valid but ingredient ID not in DB', async () => {
      const ingredient_id = '10000';
      const res = await response(ingredient_id, token);

      expect(res.status).toBe(404);
    });

    it('should return specific ingredient if valid ingredient ID', async () => {
      const res = await response(ingredient.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', ingredient.id);
      expect(res.body).toHaveProperty('name', ingredient.name);
      expect(res.body).toHaveProperty('description', ingredient.description);
      expect(res.body).toHaveProperty('serving_size', ingredient.serving_size);
      expect(res.body).toHaveProperty('calories', ingredient.calories);
      expect(res.body).toHaveProperty('carbohydrates', ingredient.carbohydrates);
      expect(res.body).toHaveProperty('fat', ingredient.fat);
      expect(res.body).toHaveProperty('protein', ingredient.protein);
    });
  });

  describe('POST /', () => {
    let user, token, ingredient_object;

    const response = async (object, jwt) => {
      return await request
        .post('/api/ingredients')
        .send(object)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = createJWT(user);
      ingredient_object = {
        name: 'Medium Pear',
        description: 'Fruit',
        serving_size: 178.00,
        calories: 101.00,
        carbohydrates: 27.00,
        fat: 65.00,
        protein: 25.00
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(ingredient_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(ingredient_object, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if ingredient is invalid', async () => {
      ingredient_object = {};
      const res = await response(ingredient_object, token);

      expect(res.status).toBe(400);
    });

    it('should save ingredient if ingredient is valid', async () => {
      const res = await response(ingredient_object, token);
      const ingredient = await Ingredient.findOne({ where: { name: 'Medium Pear' } });

      expect(ingredient).toHaveProperty('id');
      expect(ingredient).toHaveProperty('name', 'Medium Pear');
      expect(ingredient).toHaveProperty('description', 'Fruit');
      expect(ingredient).toHaveProperty('serving_size', 178.00);
      expect(ingredient).toHaveProperty('calories', 101.00);
      expect(ingredient).toHaveProperty('carbohydrates', 27.00);
      expect(ingredient).toHaveProperty('fat', 65.00);
      expect(ingredient).toHaveProperty('protein', 25.00);
    });

    it('should return ingredient if ingredient is valid', async () => {
      const res = await response(ingredient_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Medium Pear');
      expect(res.body).toHaveProperty('description', 'Fruit');
      expect(res.body).toHaveProperty('serving_size', 178.00);
      expect(res.body).toHaveProperty('calories', 101.00);
      expect(res.body).toHaveProperty('carbohydrates', 27.00);
      expect(res.body).toHaveProperty('fat', 65.00);
      expect(res.body).toHaveProperty('protein', 25.00);
    });
  });

  describe('PUT /ID', () => {
    let user, token, ingredient, ingredient_object;

    const response = async (object, jwt, id) => {
      return await request
        .put('/api/ingredients/' + id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
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
      ingredient_object = {
        name: 'Bacon',
        description: 'Pork Bacon',
        serving_size: 35.00,
        calories: 161.00,
        carbohydrates: 0.60,
        fat: 12.00,
        protein: 12.00
      }
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(ingredient_object, token, ingredient.id);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(ingredient_object, token, ingredient.id);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid ingredient ID ', async () => {
      const ingredient_id = 'id';
      const res = await response(ingredient_object, token, ingredient_id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if ingredient ID valid but not in DB', async () => {
      const ingredient_id = '10000';
      const res = await response(ingredient_object, token, ingredient_id);

      expect(res.status).toBe(404);
    });

    // it('should return 400 if ingredient is invalid', async () => {
    //   const ingredient_object = {};
    //   const res = await response(ingredient_object, token, ingredient.id);
    //
    //   expect(res.status).toBe(400);
    // });

    it('should update ingredient if input is valid', async () => {
      const res = await response(ingredient_object, token, ingredient.id);
      const result = await Ingredient.findOne({ where: { id: ingredient.id } });

      expect(result).toHaveProperty('name', 'Bacon');
      expect(result).toHaveProperty('description', 'Pork Bacon');
      expect(result).toHaveProperty('serving_size', 35.00);
      expect(result).toHaveProperty('calories', 161.00);
      expect(result).toHaveProperty('carbohydrates', 0.60);
      expect(result).toHaveProperty('fat', 12.00);
      expect(result).toHaveProperty('protein', 12.00);
    });

    it('should return updated ingredient if it is valid', async () => {
      const res = await response(ingredient_object, token, ingredient.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', ingredient.id);
      expect(res.body).toHaveProperty('name', 'Bacon');
      expect(res.body).toHaveProperty('description', 'Pork Bacon');
      expect(res.body).toHaveProperty('serving_size', 35.00);
      expect(res.body).toHaveProperty('calories', 161.00);
      expect(res.body).toHaveProperty('carbohydrates', 0.60);
      expect(res.body).toHaveProperty('fat', 12.00);
      expect(res.body).toHaveProperty('protein', 12.00);
    });
  });

  describe('DELETE /ID', () => {
    let user, token, ingredient;

    const response = async (id, jwt) => {
      return await request
        .delete('/api/ingredients/' + id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
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
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(ingredient.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(ingredient.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid ingredient ID', async () => {
      const ingredient_id = 'id';
      const res = await response(ingredient_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if ingredient ID valid but not in DB', async () => {
      const ingredient_id = '100000';
      const res = await response(ingredient_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete ingredient if input is valid', async () => {
      const res = await response(ingredient.id, token);
      const result = await Ingredient.findOne({ where: { id: ingredient.id } });

      expect(result).toBeNull();
    });

    it('should return deleted ingredient', async () => {
      const res = await response(ingredient.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', ingredient.id);
      expect(res.body).toHaveProperty('name', ingredient.name);
      expect(res.body).toHaveProperty('description', ingredient.description);
      expect(res.body).toHaveProperty('serving_size', ingredient.serving_size);
      expect(res.body).toHaveProperty('calories', ingredient.calories);
      expect(res.body).toHaveProperty('carbohydrates', ingredient.carbohydrates);
      expect(res.body).toHaveProperty('fat', ingredient.fat);
      expect(res.body).toHaveProperty('protein', ingredient.protein);
    });
  });
});
