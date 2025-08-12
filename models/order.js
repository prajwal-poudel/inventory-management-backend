'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // Order belongs to Customer
      Order.belongsTo(models.Customer, {
        foreignKey: 'customerId',
        as: 'customer'
      });
      
      // Order belongs to Product
      Order.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
      });
      
      // Order belongs to Inventory
      Order.belongsTo(models.Inventory, {
        foreignKey: 'inventoryId',
        as: 'inventory'
      });
      
      // Order belongs to User (who verified/added the order)
      Order.belongsTo(models.User, {
        foreignKey: 'orderVerifiedBy',
        as: 'verifiedBy'
      });
      
      // Order has one delivery
      Order.hasOne(models.Delivery, {
        foreignKey: 'order_id',
        as: 'delivery'
      });
      
      // Order belongs to Unit
      Order.belongsTo(models.Unit, {
        foreignKey: 'unit_id',
        as: 'unit'
      });
    }
  }
  
  Order.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customer',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'product',
        key: 'id'
      }
    },
    inventoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'inventory',
        key: 'id'
      }
    },
    orderVerifiedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    unit_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'units',
        key: 'id'
      }
    },
    status: {
      type:Sequelize.ENUM,
      values:['pending','confirmed','shipped','delivered','cancelled'],
      allowNull:false,
      defaultValue:'pending'
    },
    paymentMethod: {
      type:Sequelize.ENUM,
      values:['cash','cheque','card','no'],
      allowNull:false,
      defaultValue:'no'
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    totalAmount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'order',
    timestamps: true
  });
  
  return Order;
};