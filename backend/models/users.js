import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";

export const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      args: "username",
      msg: "Username already exists",
    },
    validate: {
      len: {
        args: [3, 20],
        msg: "Username must be between 3 and 20 characters long",
      },
      is: {
        args: /^[a-z0-9_-]+$/i,
        msg: "Username must only contain letters, numbers, underscores and hyphens",
      },
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      args: "email",
      msg: "Email already exists",
    },
    validate: {
      isEmail: {
        args: true,
        msg: "Email must be in a valid format",
      }
    },
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
