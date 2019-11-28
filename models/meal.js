module.exports = function(sequelize, DataTypes) {
  return sequelize.define('meal', {
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
    }
  }, {});
};
