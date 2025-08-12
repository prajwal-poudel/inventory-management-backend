'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductUnits extends Model {
    static associate(models) {
      // ProductUnits belongs to Product
      ProductUnits.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
      
      // ProductUnits belongs to Unit
      ProductUnits.belongsTo(models.Unit, {
        foreignKey: 'unit_id',
        as: 'unit'
      });
    }
  }
  
  ProductUnits.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'product',
        key: 'id'
      }
    },
    unit_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'units',
        key: 'id'
      }
    },
    rate: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Rate must be a positive number'
        },
        isNumeric: {
          msg: 'Rate must be a valid number'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'ProductUnits',
    tableName: 'product_units',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'unit_id']
      }
    ]
  });
  
  return ProductUnits;
};