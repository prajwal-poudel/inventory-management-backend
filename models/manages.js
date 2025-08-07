'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Manages extends Model {
    static associate(models) {
      // Manages belongs to User
      Manages.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // Manages belongs to Inventory
      Manages.belongsTo(models.Inventory, {
        foreignKey: 'inventory_id',
        as: 'inventory'
      });
    }
  }
  
  Manages.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
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
    modelName: 'Manages',
    tableName: 'manages',
    timestamps: true
  });
  
  return Manages;
};