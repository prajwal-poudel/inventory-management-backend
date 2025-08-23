'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StockTransfer extends Model {
    static associate(models) {
      // StockTransfer belongs to Stock
      StockTransfer.belongsTo(models.Stock, {
        foreignKey: 'stock_id',
        as: 'stock'
      });
      
      // StockTransfer belongs to source Inventory
      StockTransfer.belongsTo(models.Inventory, {
        foreignKey: 'sourceInventory_id',
        as: 'sourceInventory'
      });
      
      // StockTransfer belongs to target Inventory
      StockTransfer.belongsTo(models.Inventory, {
        foreignKey: 'targetInventory_id',
        as: 'targetInventory'
      });
      
      // StockTransfer belongs to User who transferred
      StockTransfer.belongsTo(models.User, {
        foreignKey: 'transferredBy',
        as: 'transferrer'
      });
      
      // StockTransfer belongs to User who received
      StockTransfer.belongsTo(models.User, {
        foreignKey: 'receivedBy',
        as: 'receiver'
      });
    }
  }
  
  StockTransfer.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    stock_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'stock',
        key: 'id'
      }
    },
    sourceInventory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'inventory',
        key: 'id'
      }
    },
    targetInventory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'inventory',
        key: 'id'
      },
      validate: {
        notEqualToSourceInventory(value) {
          if (value === this.sourceInventory_id) {
            throw new Error('Source and target inventories cannot be the same');
          }
        }
      }
    },
    transferQuantity: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: 'Transfer quantity must be greater than 0'
        }
      }
    },
    transferDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_transit', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    transferredBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    receivedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'StockTransfer',
    tableName: 'stock_transfers',
    timestamps: true,
    hooks: {
      beforeValidate: (transfer, options) => {
        // Ensure sourceInventory_id and targetInventory_id are different
        if (transfer.sourceInventory_id === transfer.targetInventory_id) {
          throw new Error('Source and target inventories cannot be the same');
        }
      },
      beforeUpdate: (transfer, options) => {
        // Set completedAt when status changes to completed
        if (transfer.changed('status') && transfer.status === 'completed' && !transfer.completedAt) {
          transfer.completedAt = new Date();
        }
      }
    },
    validate: {
      differentInventories() {
        if (this.sourceInventory_id === this.targetInventory_id) {
          throw new Error('Source and target inventories must be different');
        }
      }
    }
  });
  
  return StockTransfer;
};