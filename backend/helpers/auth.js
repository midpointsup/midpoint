import { AccessToken } from "../models/accessTokens.js";
import jwt from "jsonwebtoken";

export const generateAccessToken = async (id) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  await AccessToken.create({
    access_token: token,
    expires_in: tomorrow.toISOString(),
    UserId: id,
  });
  return token;
};
