'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Coordinate extends Model {
    static associate(models) {
      // Coordinate belongs to Customer
      Coordinate.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer'
      });
    }
  }
  
  Coordinate.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    lat: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    lng: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customer',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Coordinate',
    tableName: 'coordinate',
    timestamps: true
  });
  
  return Coordinate;
};