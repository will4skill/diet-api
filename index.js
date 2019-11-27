const express = require('express');
const app = express();
const config = require('config');
require('express-async-errors');
const helmet = require('helmet');
const compression = require('compression')
const cors = require('cors');


app.use(helmet());
app.use(compression());
app.use(cors());
app.get('/api', (req, res) => {
  const url = "https://github.com/jtimwill/diet-api";
  res.send(`See README for API use instructions: ${url}`);
});
app.use(express.json());


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
