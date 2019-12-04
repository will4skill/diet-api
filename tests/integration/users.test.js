const { User, Diet, sequelize } = require('../../sequelize');
const server = require('../../index');
const request = require('supertest')(server);
const createJWT = require('../../utilities/tokenUtility');

describe('/api/users', () => {
  afterEach(async () => {
    await User.destroy({ where: {} });
    await Diet.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let token, user, diet;

    const response = async (jwt) => {
      return await request
        .get('/api/users')
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      diet = await Diet.create({
        name: 'Keto',
        description: 'Low-carb, high-fat',
        carbohydrates: 10.00,
        fat: 65.00,
        protein: 25.00
      });
      user = User.build({ admin: true });
      token = createJWT(user);

      await User.bulkCreate([
        { username: 'bob' , email: 'bob@example.com', password_digest: 123456, calories: 2400, dietId: diet.id },
        { username: 'tom' , email: 'tom@example.com', password_digest: 123456, calories: 2000, dietId: diet.id }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(token);

      expect(res.status).toBe(403);
    });

    it('should return all users (stat code 200)', async () => {
      const res = await response(token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(u => u.username === 'bob')).toBeTruthy();
      expect(res.body.some(u => u.email === 'bob@example.com')).toBeTruthy();
      expect(res.body.some(u => u.calories === 2400)).toBeTruthy();
      expect(res.body.some(u => u.dietId === diet.id)).toBeTruthy();
      expect(res.body.some(u => u.username === 'tom')).toBeTruthy();
      expect(res.body.some(u => u.email === 'tom@example.com')).toBeTruthy();
      expect(res.body.some(u => u.calories === 2000)).toBeTruthy();
    });
  });

  describe('POST /', () => {
    let user_object, diet;

    const response = async (object) => {
      return await request
        .post('/api/users')
        .send(object);
    };

    beforeEach(async () => {
      diet = await Diet.create({
        name: 'Keto',
        description: 'Low-carb, high-fat',
        carbohydrates: 10.00,
        fat: 65.00,
        protein: 25.00
      });
      user_object = {
        username: 'bob',
        email: 'bob@example.com',
        password: '123456',
        calories: 2400,
        dietId: diet.id
      };
    });

    it('should return 400 if invalid diet ID ', async () => {
      user_object.dietId = 'id';
      const res = await response(user_object);

      expect(res.status).toBe(400);
    });

    it('should return 400 if diet ID valid but diet ID not in DB', async () => {
      user_object.dietId = '10000';
      const res = await response(user_object);

      expect(res.status).toBe(400);
    });

    it('should return 400 if user is invalid', async () => {
      user_object = { email: 'bob@example.com', password: '123', dietId: diet.id };
      const res = await response(user_object);

      expect(res.status).toBe(400);
    });

    it('should return 400 if user exists already', async () => {
      const first_user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: '123456',
        calories: 2400,
        dietId: diet.id
      });
      const res = await response(user_object);

      expect(res.status).toBe(400);
    });

    it('should save user if user is valid', async () => {
      const res = await response(user_object);
      const user = await User.findOne({ where: { username: 'bob' } });

      expect(res.status).toBe(200);
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('username', 'bob');
      expect(user).toHaveProperty('email', 'bob@example.com');
      expect(user).toHaveProperty('password_digest');
      expect(user).toHaveProperty('calories');
      expect(user).toHaveProperty('dietId');
    });

    it('should return jwt if user is valid', async () => {
      const res = await response(user_object);

      expect(res.header).toHaveProperty('x-auth-token');
    });
  });

  describe('GET /ME', () => {
    let user, token, diet;
    const response = async (jwt) => {
      return await request
        .get('/api/users/me')
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      diet = await Diet.create({
        name: 'Keto',
        description: 'Low-carb, high-fat',
        carbohydrates: 10.00,
        fat: 65.00,
        protein: 25.00
      });
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: '123456',
        calories: 2400,
        dietId: diet.id
      });
      token = createJWT(user);
    });


    it('should return 401 if client not logged in', async () => {
      const token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it('should return specific user if valid ID', async () => {
      const res = await response(token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('username', user.username);
      expect(res.body).toHaveProperty('email', user.email);
      expect(res.body).toHaveProperty('calories', user.calories);
      expect(res.body).toHaveProperty('dietId', diet.id);
    });
  });

  describe('PUT /ME', () => {
    let user, token, user_object, diet_1, diet_2;

    const response = async (object, jwt) => {
      return await request
        .put('/api/users/me')
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      diet_1 = await Diet.create({
        name: 'Keto',
        description: 'Low-carb, high-fat',
        carbohydrates: 10.00,
        fat: 65.00,
        protein: 25.00
      });
      diet_2 = await Diet.create({
        name: 'Balanced',
        description: 'Balanced macro distribution',
        carbohydrates: 50.00,
        fat: 20.00,
        protein: 30.00
      });
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: '123456',
        calories: 2400,
        dietId: diet_1.id
      });
      token = createJWT(user);
      user_object = { username: 'binky', email: 'binky@badbunny.com', calories: 2000, dietId: diet_2.id }
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(user_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 400 if invalid diet ID ', async () => {
      user_object.dietId = 'id';
      const res = await response(user_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if diet ID valid but diet ID not in DB', async () => {
      user_object.dietId = '10000';
      const res = await response(user_object, token);

      expect(res.status).toBe(400);
    });

    // it('should return 400 if user is invalid', async () => {
    //   user_object = { username: '' };
    //   const res = await response(user_object, token);
    //
    //   expect(res.status).toBe(400);
    // });

    it('should update user if input is valid', async () => {
      const res = await response(user_object, token);
      const result = await User.findOne({ where: { id: user.id }});

      expect(result).toHaveProperty('username', 'binky');
      expect(result).toHaveProperty('email', 'binky@badbunny.com');
      expect(result).toHaveProperty('calories', 2000);
      expect(result).toHaveProperty('dietId', diet_2.id);
    });

    it('should return updated user if it is valid', async () => {
      const res = await response(user_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('username', 'binky');
      expect(res.body).toHaveProperty('email', 'binky@badbunny.com');
      expect(res.body).toHaveProperty('calories', 2000);
      expect(res.body).toHaveProperty('dietId', diet_2.id);
    });
  });

  describe('DELETE /ID', () => {
    let user, token, diet;

    const response = async (id, jwt) => {
      return await request
        .delete('/api/users/' + id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      diet = await Diet.create({
        name: 'Keto',
        description: 'Low-carb, high-fat',
        carbohydrates: 10.00,
        fat: 65.00,
        protein: 25.00
      });
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        admin: true,
        password_digest: '123456',
        calories: 2400,
        dietId: diet.id
      });
      token = createJWT(user);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(user.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not an admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(user.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid ID', async () => {
      user = User.build({ admin: true });
      token = createJWT(user);
      const user_id = 'id';
      const res = await response(user_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if id valid but ID not in DB', async () => {
      const user_id = 10000;
      const res = await response(user_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete user if input is valid', async () => {
      const res = await response(user.id, token);
      const result = await User.findOne({ where: { id: user.id }});

      expect(result).toBeNull();
    });

    it('should return deleted user', async () => {
      const res = await response(user.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', user.id);
      expect(res.body).toHaveProperty('username', user.username);
      expect(res.body).toHaveProperty('email', user.email);
      expect(res.body).toHaveProperty('calories', user.calories);
      expect(res.body).toHaveProperty('dietId', diet.id);
    });
  });
});
