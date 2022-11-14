'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ArtworkLike extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ArtworkLike.belongsTo(models.User, { foreignKey: 'userId' });
      ArtworkLike.belongsTo(models.Artwork, { foreignKey: 'artworkId' });
    }
  }

  ArtworkLike.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      artworkId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'ArtworkLike',
      timestamps: true,
      paranoid: true,
    },
  );

  return ArtworkLike;
};
