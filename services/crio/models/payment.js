'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Payment.belongsTo(models.User, { foreignKey: 'userId' });
      Payment.belongsTo(models.User, { foreignKey: 'customerEmail', targetKey: 'email' });
    }
  }

  Payment.init({
    userId: {
      type:  DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    periodStart: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    periodEnd: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    subscriptionStatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subscriptionCancel: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastEventSnapshot: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Payment',
    timestamps: true,
    paranoid: true,
  });
  return Payment;
};
