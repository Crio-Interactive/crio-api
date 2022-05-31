const { Model } = require('sequelize');
const { ACCESSIBILITY } = require('../../constants');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  Product.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
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
      },
      limit: {
        type: DataTypes.SMALLINT,
      },
      accessibility: {
        type: DataTypes.ENUM,
        values: Object.values(ACCESSIBILITY),
        default: ACCESSIBILITY.SUBSCRIBER_ONLY,
      },
      thumbnail: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'Product',
      timestamps: true,
      paranoid: true,
    },
  );

  return Product;
};
