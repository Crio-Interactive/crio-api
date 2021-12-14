'use strict';
const { Model } = require('sequelize');

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
      name: {
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
      artworkId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      videoUri: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      thumbnailUri: {
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
    },
    {
      sequelize,
      modelName: 'RandomArtwork',
      timestamps: false,
    },
  );

  return RandomArtwork;
};
