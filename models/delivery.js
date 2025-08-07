'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Delivery extends Model {
    static associate(models) {
      // Delivery belongs to Order
      Delivery.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
      
      // Delivery belongs to Driver
      Delivery.belongsTo(models.Driver, {
        foreignKey: 'driver_id',
        as: 'driver'
      });
    }
  }
  
  Delivery.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'order',
        key: 'id'
      }
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'driver',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Delivery',
    tableName: 'delivery',
    timestamps: true
  });
  
  return Delivery;
};