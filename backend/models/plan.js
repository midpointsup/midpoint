import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { User } from "./users.js";

export const Plan = sequelize.define("Plan", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  memberCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

// A User can own many Plans
User.hasMany(Plan, { foreignKey: "ownerId" });

// A Plan belongs to a User as its owner
Plan.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// Many to many relationship between User and Plan
Plan.belongsToMany(User, { through: "UserPlan" });
User.belongsToMany(Plan, { through: "UserPlan" });
