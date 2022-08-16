"use strict";
const { Model } = require("sequelize");
const db = require(".");

module.exports = (sequelize, DataTypes) => {
  class Holder extends Model {
    static associate(models) {
    
    }
  }
  Holder.init(
		{
			discordId: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},
			address: { type: DataTypes.STRING, allowNull: false,},
		},
		{
			sequelize,
			timestamps: false,
			modelName: "Holder",
			tableName: "holder",
			charset: "utf8mb4",
			collate: "utf8mb4_general_ci",
		}
	);
  return Holder;
};