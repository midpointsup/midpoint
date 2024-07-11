import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { User } from "./users.js";
import { Plan } from "./plan.js";

export const Trip = sequelize.define("Trip", {
  startLocation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endLocation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  transportationMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  radius: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

Trip.belongsTo(Plan);
Plan.hasMany(Trip);

Trip.belongsTo(User);
User.hasMany(Trip);
