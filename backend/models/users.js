import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
//import { Plan } from "./plan.js";

export const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  picture: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});
