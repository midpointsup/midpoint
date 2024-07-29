import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { User } from "./users.js";
import { Trip } from "./trip.js";

export const Plan = sequelize.define("Plan", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  memberCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  colour: {
    type: DataTypes.STRING,
    defaultValue: "#4dc48a",
  },
});

// A User can own many Plans
User.hasMany(Plan, { foreignKey: "ownerId" });

// A Plan belongs to a User as its owner
Plan.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// A Plan has many Trips
Plan.hasMany(Trip, {
  foreignKey: "PlanId",
  as: "trips",
  onDelete: "cascade",
  hooks: true,
});

// Many to many relationship between User and Plan
Plan.belongsToMany(User, { through: "UserPlan", as: "members" });
User.belongsToMany(Plan, { through: "UserPlan", as: "plans" });
