'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Voucher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Voucher.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  Voucher.init({
    userid: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    tier1: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tier2: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tier3: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Voucher',
    timestamps: true,
    paranoid: true,
  });
  return Voucher;
};
