const { Model } = require('sequelize');

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
    }
  }

  Artwork.init(
    {
      userId: {
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
        unique: true,
        allowNull: true,
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