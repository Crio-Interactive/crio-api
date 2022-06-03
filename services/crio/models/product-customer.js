const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductCustomer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductCustomer.belongsTo(models.Product, { foreignKey: 'productId' });
    }
  }

  ProductCustomer.init(
    {
      userId: {
        type: DataTypes.INTEGER,
      },
      customerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      eventSnapshot: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'ProductCustomer',
      timestamps: true,
      paranoid: true,
    },
  );

  return ProductCustomer;
};
