'use strict';
const { Model } = require('sequelize');
const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  User.init(
    {
      userId: {
        type: DataTypes.STRING,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: {
            msg: 'Please input valid email address',
          },
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'User',
      timestamps: true,
      paranoid: true,
    },
  );
  return User;
};
