'use strict';
const { Model } = require('sequelize');
const { ACCESSIBILITY } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  class RandomArtwork extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  RandomArtwork.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
      },
      artworkId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      thumbnail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      accessibility: {
        type: DataTypes.ENUM,
        values: Object.values(ACCESSIBILITY),
        default: ACCESSIBILITY.SUBSCRIBER_ONLY,
      },
      categoryId: {
        type: DataTypes.INTEGER,
      },
      likes: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: 'RandomArtwork',
      timestamps: false,
    },
  );

  return RandomArtwork;
};
