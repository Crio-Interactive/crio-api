'use strict';
const { Model } = require('sequelize');
const { ACCESSIBILITY } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  class RandomProduct extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  RandomProduct.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      providerType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      providerUserId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      avatar: {
        type: DataTypes.STRING,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      limit: {
        type: DataTypes.INTEGER,
      },
      accessibility: {
        type: DataTypes.ENUM,
        values: Object.values(ACCESSIBILITY),
        default: ACCESSIBILITY.SUBSCRIBER_ONLY,
      },
      thumbnail: {
        type: DataTypes.STRING,
      },
      file: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'RandomProduct',
      timestamps: false,
    },
  );

  return RandomProduct;
};
