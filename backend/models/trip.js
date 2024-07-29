import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { User } from "./users.js";

export const Trip = sequelize.define("Trip", {
  startLocation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  endLocation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  transportationMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  radius: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  waypoints: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
});

Trip.belongsTo(User);
User.hasMany(Trip, { foreignKey: "UserId", onDelete: "cascade", hooks: true });
