'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Unit extends Model {
    static associate(models) {
      // Unit has many ProductUnits (rates for different products)
      Unit.hasMany(models.ProductUnits, {
        foreignKey: 'unit_id',
        as: 'productUnits'
      });
      
      // Unit has many Stock records
      Unit.hasMany(models.Stock, {
        foreignKey: 'unit_id',
        as: 'stocks'
      });
      
      // Unit has many Orders
      Unit.hasMany(models.Order, {
        foreignKey: 'unit_id',
        as: 'orders'
      });
    }
  }
  
  Unit.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Unit name cannot be empty'
        },
        len: {
          args: [1, 50],
          msg: 'Unit name must be between 1 and 50 characters'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Unit',
    tableName: 'units',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ]
  });
  
  return Unit;
};