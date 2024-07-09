import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { User } from "./users.js";

export const AccessToken = sequelize.define("AccessToken", {
  access_token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expires_in: {
    type: DataTypes.DATE,
    allowNull: false
  },
});

AccessToken.belongsTo(User);
User.hasMany(AccessToken);