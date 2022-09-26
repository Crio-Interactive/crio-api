const { Model } = require('sequelize');
const { ACCESSIBILITY } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  class Artwork extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Artwork.belongsTo(models.User, { foreignKey: 'userId' });
      Artwork.belongsTo(models.Category, { foreignKey: 'categoryId' });
    }
  }

  Artwork.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accessibility: {
        type: DataTypes.ENUM,
        values: Object.values(ACCESSIBILITY),
        default: ACCESSIBILITY.SUBSCRIBER_ONLY,
      },
      pictures_uri: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Artwork',
      timestamps: true,
      paranoid: true,
    },
  );

  return Artwork;
};
