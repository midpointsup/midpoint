// import { verify } from "jsonwebtoken";
// import User from "../models/user";
// import { JWT_SECRET } from "../config";

export const isAuthenticated = (req, res, next) => {
  //   try {
  //     const token = req.headers.authorization.split(" ")[1];
  //     const decoded = verify(token, process.env.JWT_SECRET);
  //     req.user = decoded;
  //     next();
  //   } catch (error) {
  //     return res.status(401).json({ error: "Authentication failed" });
  //   }
};
