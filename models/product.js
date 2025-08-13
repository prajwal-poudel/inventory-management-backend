'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // Product belongs to Category
      Product.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });
      
      // Product has many orders
      Product.hasMany(models.Order, {
        foreignKey: 'productId',
        as: 'orders'
      });
      
      // Product has many stock records
      Product.hasMany(models.Stock, {
        foreignKey: 'product_id',
        as: 'stocks'
      });
      
      // Product has many ProductUnits (rates for different units)
      Product.hasMany(models.ProductUnits, {
        foreignKey: 'product_id',
        as: 'productUnits'
      });
    }
  }
  
  Product.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    productName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'category',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'product',
    timestamps: true
  });
  
  return Product;
};