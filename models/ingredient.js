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
      type: DataTypes.FLOAT,
      allowNull: false
    },
    calories: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    carbohydrates: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    fat: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    protein: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {});
};
