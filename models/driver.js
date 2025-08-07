'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Driver extends Model {
    static associate(models) {
      // Driver has many deliveries
      Driver.hasMany(models.Delivery, {
        foreignKey: 'driver_id',
        as: 'deliveries'
      });
      Driver.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      })
    }
  }
  
  Driver.init({
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
    phoneNumber: {
      type: DataTypes.STRING(32),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Driver',
    tableName: 'driver',
    timestamps: true
  });
  
  return Driver;
};