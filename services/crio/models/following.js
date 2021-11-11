'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Following extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Following.belongsTo(models.User, { foreignKey: 'userId' });
      Following.belongsTo(models.User, { foreignKey: 'followingId' });
    }
  }

  Following.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      followingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Following',
      timestamps: true,
      paranoid: true,
    },
  );
  return Following;
};
