'use strict';
const { Model } = require('sequelize');

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
        allowNull: false,
        unique: true,
      },
      providerType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      providerUserId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
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
      image: {
        type: DataTypes.STRING,
      },
      about: {
        type: DataTypes.TEXT,
      },
      stripeAccountId: {
        type: DataTypes.STRING,
      },
      featuresSeen: {
        type: DataTypes.BOOLEAN,
        default: false,
      },
      helpSeen: {
        type: DataTypes.BOOLEAN,
        default: false,
      },
      showRevenue: {
        type: DataTypes.BOOLEAN,
        default: true,
      },
      emailVisible: {
        type: DataTypes.BOOLEAN,
        default: true,
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
