module.exports = function(sequelize, DataTypes) {
  return sequelize.define('meal_ingredient', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    servings: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
};
