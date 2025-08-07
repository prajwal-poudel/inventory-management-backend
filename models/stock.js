'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Stock extends Model {
    static associate(models) {
      // Stock belongs to Product
      Stock.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
      
      // Stock belongs to Inventory
      Stock.belongsTo(models.Inventory, {
        foreignKey: 'inventory_id',
        as: 'inventory'
      });
    }
  }
  
  Stock.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    stockKg: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    stockBori: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'product',
        key: 'id'
      }
    },
    inventory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'inventory',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Stock',
    tableName: 'stock',
    timestamps: true
  });
  
  return Stock;
};