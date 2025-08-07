'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      // Customer has many orders
      Customer.hasMany(models.Order, {
        foreignKey: 'customerId',
        as: 'orders'
      });
      
      // Customer has coordinates
      Customer.hasOne(models.Coordinate, {
        foreignKey: 'customer_id',
        as: 'coordinate'
      });
    }
  }
  
  Customer.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fullname: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    coordinateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'coordinate',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Customer',
    tableName: 'customer',
    timestamps: true
  });
  
  return Customer;
};