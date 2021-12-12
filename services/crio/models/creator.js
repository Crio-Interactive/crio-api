'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Creator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  Creator.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Please input valid email address',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Creator',
      timestamps: true,
      paranoid: true,
    },
  );

  return Creator;
};
