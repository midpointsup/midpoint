import { User } from "../models/users.js";
import jwt from 'jsonwebtoken';

export const isAuthenticated = async function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ error: "Not authenticated." });
    }
    req.user = user;
  }
  next();
};
