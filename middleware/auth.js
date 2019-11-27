const config = require('config');
const jwt = require('jsonwebtoken');

function authenticateUser(req, res, next) {
  if (!config.get('auth_middleware_on')) return next();

  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).send('Unauthorized');
  }
  else {
    try {
      const secret = config.get('jwt_private_key');
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      next();
    }
    catch (ex) {
      res.status(400).send('Bad Request, Invalid JWT');
    }
  }
}
module.exports = authenticateUser;
