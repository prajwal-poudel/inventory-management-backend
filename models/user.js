'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User manages inventory items
      User.hasMany(models.Manages, {
        foreignKey: 'user_id',
        as: 'managedItems'
      });
      User.hasOne(models.Driver, {
        foreignKey: 'user_id',
        as: 'driver'
      });
      
      // User can verify/add orders
      User.hasMany(models.Order, {
        foreignKey: 'orderVerifiedBy',
        as: 'verifiedOrders'
      });
    }
  }
  
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fullname: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'superadmin', 'driver'),
      allowNull: false,
      defaultValue: 'driver'
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'user',
    timestamps: true
  });
  
  return User;
};