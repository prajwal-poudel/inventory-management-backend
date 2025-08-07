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
      
      // Order has one delivery
      Order.hasOne(models.Delivery, {
        foreignKey: 'order_id',
        as: 'delivery'
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
    quantity: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        isIn: [['kg', 'bori']]
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