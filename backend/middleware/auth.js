import { User } from "../models/users.js";
import jwt from 'jsonwebtoken';
import { AccessToken } from "../models/accessTokens.js";

export const isAuthenticated = async function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ where: { id: decoded.id } });
      if (!user) {
        return res.status(401).json({ error: "Not authenticated." });
      }
      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        await AccessToken.destroy({
          where: {
            access_token: token,
          },
        });
        return res.status(401).json({ error: "Token expired." });
      }
      return res.status(500).json({ error: "Failed to authenticate token" });
    }
  } else {
    return res.status(401).json({ error: "No token provided." });
  }
};
