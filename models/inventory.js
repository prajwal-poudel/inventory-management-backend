'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    static associate(models) {
      // Inventory is managed by users
      Inventory.hasMany(models.Manages, {
        foreignKey: 'inventory_id',
        as: 'managers'
      });
      
      // Inventory has many stock records
      Inventory.hasMany(models.Stock, {
        foreignKey: 'inventory_id',
        as: 'stock'
      });
      
      // Inventory has many orders
      Inventory.hasMany(models.Order, {
        foreignKey: 'inventoryId',
        as: 'orders'
      });
      
      // Inventory has many outgoing stock transfers (as source)
      Inventory.hasMany(models.StockTransfer, {
        foreignKey: 'sourceInventory_id',
        as: 'outgoingTransfers'
      });
      
      // Inventory has many incoming stock transfers (as target)
      Inventory.hasMany(models.StockTransfer, {
        foreignKey: 'targetInventory_id',
        as: 'incomingTransfers'
      });
    }
  }
  
  Inventory.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    inventoryName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    contactNumber: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Inventory',
    tableName: 'inventory',
    timestamps: true
  });
  
  return Inventory;
};