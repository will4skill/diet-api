const config = require('config');
const db = config.get('db');
let sequelize;
const Sequelize = require('sequelize');

// Import model definitions

// Create sequelize instance
if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres'
  });
} else {
  sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: db
  });
}

// Use sequelize instance and Sequelize constructor to create model classes

// Create associations between models


// Create database tables
sequelize.sync().then(() => {
  console.log("Database and tables created");
});

module.exports = {
  sequelize
};
