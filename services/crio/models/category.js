const { Model } = require('sequelize');

const { TYPES } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Category.belongsTo(models.Category, { foreignKey: 'mainCategoryId' });
      Category.hasMany(models.Product, { foreignKey: 'categoryId' });
      Category.hasMany(models.Artwork, { foreignKey: 'categoryId' });
    }
  }

  Category.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM,
        values: Object.values(TYPES),
      },
    },
    {
      sequelize,
      modelName: 'Category',
      timestamps: true,
      paranoid: true,
    },
  );

  return Category;
};
