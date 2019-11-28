module.exports = function(sequelize, DataTypes) {
  return sequelize.define('diet', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      len: [3, 30]
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    carbohydrates: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fat: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    protein: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
};
