import { User } from "../models/users.js";
import { Router } from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import path from "path";
import { AccessToken } from "../models/accessTokens.js";

const upload = multer({ dest: "uploads/" });
export const userRouter = Router();

userRouter.post("/signup", upload.single("picture"), async (req, res) => {
  if (
    req.body.username === undefined ||
    req.body.email === undefined ||
    req.body.password === undefined
  ) {
    return res
      .status(400)
      .json({ error: "Missing username, email or password" });
  }
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const password = bcrypt.hashSync(req.body.password, salt);

  try {
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: password,
    });
    return res.json({
      username: user.username,
      email: user.email,
    });
  } catch {
    return res.status(422).json({ error: "Failed to create user" });
  }
});

userRouter.post("/signin", async (req, res) => {
  if (
    req.body.username === undefined ||
    req.body.email === undefined ||
    req.body.password === undefined
  ) {
    return res
      .status(400)
      .json({ error: "Missing username, email or password" });
  }
  const user = await User.findOne({
    where: {
      email: req.body.username,
    },
  });

  if (!user) {
    return res.status(401).json({ error: "Incorrect username or password" });
  }

  const hash = user.password;
  const password = req.body.password;
  const result = bcrypt.compareSync(password, hash);

  if (!result) {
    return res.status(401).json({ error: "Incorrect username or password" });
  }
  return res.status(200).json(user);
});

userRouter.get("/me", async (req, res) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: "Missing authorization header" });
    }
    const bearer = req.headers.authorization.split(" ")[1];

    const token = await AccessToken.findOne({
      where: {
        access_token: bearer,
      },
      include: User,
    });
    if (!token) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const userId = token.UserId;
    const user = await User.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      picture: user.picture,
    });
  } catch {
    return res.status(500).json({ error: "Failed to get user" });
  }
});
