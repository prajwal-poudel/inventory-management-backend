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
      
      // Stock belongs to Unit
      Stock.belongsTo(models.Unit, {
        foreignKey: 'unit_id',
        as: 'unit'
      });
      
      // Stock has many transfers
      Stock.hasMany(models.StockTransfer, {
        foreignKey: 'stock_id',
        as: 'transfers'
      });
    }
  }
  
  Stock.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    stockQuantity: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    method: {
      // Indicates how stock moved in/out of inventory
      type: DataTypes.ENUM('transfer', 'supplier','damage','order'),
      allowNull: false,
      defaultValue: 'supplier'
    },
    in_out: {
      // Indicates how stock moved in/out of inventory
      type: DataTypes.ENUM('in', 'out'),
      allowNull: false,
      defaultValue: 'in'
    },
    unit_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'units',
        key: 'id'
      }
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