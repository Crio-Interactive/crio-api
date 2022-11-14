'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductLike extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductLike.belongsTo(models.User, { foreignKey: 'userId' });
      ProductLike.belongsTo(models.Product, { foreignKey: 'productId' });
    }
  }

  ProductLike.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'ProductLike',
      timestamps: true,
      paranoid: true,
    },
  );

  return ProductLike;
};
