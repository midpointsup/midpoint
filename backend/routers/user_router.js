import { User } from "../models/users.js";
import { Router } from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import path from "path";

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
