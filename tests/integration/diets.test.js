const { Diet, User, sequelize } = require('../../sequelize');
const createJWT = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/diets', () => {
  afterEach(async () => {
    await Diet.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let token;

    const response = async (jwt) => {
      return await request
        .get('/api/diets')
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      const user = User.build({ admin: false });
      await Diet.bulkCreate([
        {
          name: 'Keto',
          description: 'Low-carb, high-fat',
          carbohydrates: 10.00,
          fat: 65.00,
          protein: 25.00
        },
        {
          name: 'Balanced',
          description: 'Balanced macro distribution',
          carbohydrates: 50.00,
          fat: 20.00,
          protein: 30.00
        }
      ]);
    });

    it('should return all diets (stat code 200)', async () => {
      const res = await response();

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(m => m.name === 'Keto')).toBeTruthy();
      expect(res.body.some(m => m.name === 'Balanced')).toBeTruthy();
      expect(res.body.some(m => m.description === 'Low-carb, high-fat')).toBeTruthy();
      expect(res.body.some(m => m.description === 'Balanced macro distribution')).toBeTruthy();
      expect(res.body.some(m => m.carbohydrates === 10.00)).toBeTruthy();
      expect(res.body.some(m => m.carbohydrates === 50.00)).toBeTruthy();
      expect(res.body.some(m => m.fat === 65.00)).toBeTruthy();
      expect(res.body.some(m => m.fat === 20.00)).toBeTruthy();
      expect(res.body.some(m => m.protein === 25.00)).toBeTruthy();
      expect(res.body.some(m => m.protein === 30.00)).toBeTruthy();
    });
  });

  describe('GET /ID', () => {
    let user, token, diet;

    const response = async (id, jwt) => {
      return await request
        .get(`/api/diets/${id}`)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      diet = await Diet.create({
        name: 'Keto',
        description: 'Low-carb, high-fat',
        carbohydrates: 10,
        fat: 65,
        protein: 25
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(diet.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 404 if invalid diet ID', async () => {
      const diet_id = 'id';
      const res = await response(diet_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if diet ID valid but diet ID not in DB', async () => {
      const diet_id = '10000';
      const res = await response(diet_id, token);

      expect(res.status).toBe(404);
    });

    it('should return specific diet if valid diet ID', async () => {
      const res = await response(diet.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', diet.id);
      expect(res.body).toHaveProperty('name', diet.name);
      expect(res.body).toHaveProperty('description', diet.description);
      expect(res.body).toHaveProperty('carbohydrates', diet.carbohydrates);
      expect(res.body).toHaveProperty('fat', diet.fat);
      expect(res.body).toHaveProperty('protein', diet.protein);
    });
  });

  describe('POST /', () => {
    let user, token, diet_object;

    const response = async (object, jwt) => {
      return await request
        .post('/api/diets')
        .send(object)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = createJWT(user);
      diet_object = {
        name: 'Keto',
        description: 'Low-carb, high-fat',
        carbohydrates: 10.00,
        fat: 65.00,
        protein: 25.00
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(diet_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(diet_object, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if diet is invalid', async () => {
      diet_object = {};
      const res = await response(diet_object, token);

      expect(res.status).toBe(400);
    });

    it('should save diet if diet is valid', async () => {
      const res = await response(diet_object, token);
      const diet = await Diet.findOne({ where: { name: 'Keto' } });

      expect(diet).toHaveProperty('id');
      expect(diet).toHaveProperty('name', 'Keto');
      expect(diet).toHaveProperty('description', 'Low-carb, high-fat');
      expect(diet).toHaveProperty('carbohydrates', 10.00);
      expect(diet).toHaveProperty('fat', 65.00);
      expect(diet).toHaveProperty('protein', 25.00);
    });

    it('should return diet if diet is valid', async () => {
      const res = await response(diet_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Keto');
      expect(res.body).toHaveProperty('description', 'Low-carb, high-fat');
      expect(res.body).toHaveProperty('carbohydrates', 10.00);
      expect(res.body).toHaveProperty('fat', 65.00);
      expect(res.body).toHaveProperty('protein', 25.00);
    });
  });

  describe('PUT /ID', () => {
    let user, token, diet, diet_object;

    const response = async (object, jwt, id) => {
      return await request
        .put('/api/diets/' + id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = createJWT(user);
      diet = await Diet.create({
        name: 'Keto',
        description: 'Low-carb, high-fat',
        carbohydrates: 10.00,
        fat: 65.00,
        protein: 25.00
      });
      diet_object = {
        name: 'Balanced',
        description: 'Balanced macro distribution',
        carbohydrates: 50.00,
        fat: 20.00,
        protein: 30.00
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(diet_object, token, diet.id);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(diet_object, token, diet.id);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid diet ID ', async () => {
      const diet_id = 'id';
      const res = await response(diet_object, token, diet_id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if diet ID valid but not in DB', async () => {
      const diet_id = '10000';
      const res = await response(diet_object, token, diet_id);

      expect(res.status).toBe(404);
    });

    // it('should return 400 if diet is invalid', async () => {
    //   const diet_object = {};
    //   const res = await response(diet_object, token, diet.id);
    //
    //   expect(res.status).toBe(400);
    // });

    it('should update diet if input is valid', async () => {
      const res = await response(diet_object, token, diet.id);
      const result = await Diet.findOne({ where: { id: diet.id } });

      expect(result).toHaveProperty('name', 'Balanced');
      expect(result).toHaveProperty('description', 'Balanced macro distribution');
      expect(result).toHaveProperty('carbohydrates', 50);
      expect(result).toHaveProperty('fat', 20);
      expect(result).toHaveProperty('protein', 30);
    });

    it('should return updated diet if it is valid', async () => {
      const res = await response(diet_object, token, diet.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', diet.id);
      expect(res.body).toHaveProperty('name', 'Balanced');
      expect(res.body).toHaveProperty('description', 'Balanced macro distribution');
      expect(res.body).toHaveProperty('carbohydrates', 50.00);
      expect(res.body).toHaveProperty('fat', 20.00);
      expect(res.body).toHaveProperty('protein', 30.00);
    });
  });

  describe('DELETE /ID', () => {
    let user, token, diet;

    const response = async (id, jwt) => {
      return await request
        .delete('/api/diets/' + id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = createJWT(user);
      diet = await Diet.create({
        name: 'Keto',
        description: 'Low-carb, high-fat',
        carbohydrates: 10.00,
        fat: 65.00,
        protein: 25.00
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(diet.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(diet.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid diet ID', async () => {
      const diet_id = 'id';
      const res = await response(diet_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if diet ID valid but not in DB', async () => {
      const diet_id = '100000';
      const res = await response(diet_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete diet if input is valid', async () => {
      const res = await response(diet.id, token);
      const result = await Diet.findOne({ where: { id: diet.id } });

      expect(result).toBeNull();
    });

    it('should return deleted diet', async () => {
      const res = await response(diet.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', diet.id);
      expect(res.body).toHaveProperty('name', diet.name);
      expect(res.body).toHaveProperty('description', diet.description);
      expect(res.body).toHaveProperty('carbohydrates', diet.carbohydrates);
      expect(res.body).toHaveProperty('fat', diet.fat);
      expect(res.body).toHaveProperty('protein', diet.protein);
    });
  });
});
