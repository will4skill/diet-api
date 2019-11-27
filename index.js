const express = require('express');
const app = express();
const config = require('config');
require('express-async-errors');
const helmet = require('helmet');
const compression = require('compression')
const cors = require('cors');

const users = require('./routes/users');
const diets = require('./routes/diets');
const meals = require('./routes/meals');
const ingredients = require('./routes/ingredients');
const login = require('./routes/login');

const error = require('./middleware/error');

app.use(helmet());
app.use(compression());
app.use(cors());
app.get('/api', (req, res) => {
  const url = "https://github.com/jtimwill/diet-api";
  res.send(`See README for API use instructions: ${url}`);
});
app.use(express.json());
app.use('/api/users', users);
app.use('/api/diets', diets);
app.use('/api/meals', meals);
app.use('/api/ingredients', ingredients);
app.use('/api/login', login);

app.use(error);

if (!config.get('jwt_private_key'))
  throw new Error('FATAL ERROR: jwt_private_key is not defined.');

if (!config.get('bcrypt_salt'))
  throw new Error('FATAL ERROR: bcrypt_salt is not defined.');

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || config.get('port');
  const server = app.listen(port, () => console.log(`Listening on port ${port}...`));
}
module.exports = app;
