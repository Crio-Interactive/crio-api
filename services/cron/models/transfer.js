'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transfer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transfer.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  Transfer.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      stripeAccountId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      snapshot: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Transfer',
      timestamps: true,
      paranoid: true,
    },
  );

  return Transfer;
};
