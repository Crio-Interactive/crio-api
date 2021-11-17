'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {}

  User.init(
    {
      userId: {
        type: DataTypes.STRING,
        unique: true,
      },
      fbUserId: {
        type: DataTypes.STRING,
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
      visibility: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: ['name', 'username', 'email'],
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
