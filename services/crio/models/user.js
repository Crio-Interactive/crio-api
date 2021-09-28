'use strict';
const { Model } = require('sequelize');
const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    get age() {
      if (!this.dob) {
        return null;
      }
      return moment().diff(moment(this.dob), 'years');
    }

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
      email: {
        type: DataTypes.STRING,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
      },
      gender: {
        type: DataTypes.STRING,
      },
      dob: {
        type: DataTypes.DATE,
      },
      weight: {
        type: DataTypes.FLOAT,
      },
      height: {
        type: DataTypes.FLOAT,
      },
      address: {
        type: DataTypes.STRING,
      },
      diagnosis: {
        type: DataTypes.STRING,
      },
      eventDate: {
        type: DataTypes.DATE,
      },
      cardiologist: {
        type: DataTypes.STRING,
      },
      userId: {
        type: DataTypes.STRING,
      },
      adminId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isFaceIdEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      timezone: {
        type: DataTypes.TEXT,
        allowNull: true,
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
