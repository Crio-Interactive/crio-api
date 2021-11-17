'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subscriber extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Subscriber.belongsTo(models.User, { foreignKey: 'userId' });
      Subscriber.belongsTo(models.User, { foreignKey: 'subscriberId' });
    }
  }

  Subscriber.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subscriberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Subscriber',
      timestamps: true,
      paranoid: true,
    },
  );
  return Subscriber;
};
