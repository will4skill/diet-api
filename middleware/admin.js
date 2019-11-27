const config = require('config');

function isAdmin(req, res, next) {
  if (!config.get('admin_middleware_on')) return next();

  if (req.user.admin === false) {
    return res.status(403).send('Forbidden');
  } else {
    next();
  }
}
module.exports = isAdmin;
