module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ingredient', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      len: [3, 30]
    },
    description: {
      type: DataTypes.TEXT,
    },
    serving_size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    calories: {
      type: DataTypes.INTEGER,
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
