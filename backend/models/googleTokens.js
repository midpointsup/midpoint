import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { User } from "./users.js";

export const GoogleToken = sequelize.define("GoogleToken", {
  access_token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  refresh_token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

GoogleToken.belongsTo(User);
User.hasOne(GoogleToken);
