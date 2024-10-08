import { User } from "../models/users.js";
import { Router } from "express";
import bcrypt from "bcrypt";
import { AccessToken } from "../models/accessTokens.js";
import "dotenv/config";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { generateAccessToken } from "../helpers/auth.js";
import { Op } from "sequelize";
import { isAuthenticated } from "../middleware/auth.js";

export const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
  if (req.body.username === undefined || req.body.email === undefined) {
    return res.status(400).json({ error: "Missing username or email" });
  }

  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const password = req.body.password
    ? bcrypt.hashSync(req.body.password, salt)
    : null;
  try {
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: password,
      picture: req.body.picture,
    });
    const token = await generateAccessToken(user.id);
    return res.json({
      username: user.username,
      email: user.email,
      token: token,
      userId: user.id,
    });
  } catch (error) {
    return res.status(422).json({ error: error.errors[0].message });
  }
});

userRouter.post("/signin", async (req, res) => {
  if (req.body.username === undefined || req.body.password === undefined) {
    return res.status(400).json({ error: "Missing username or password" });
  }
  const user = await User.findOne({
    where: {
      username: req.body.username,
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
  const token = await generateAccessToken(user.id);
  return res.status(200).json({
    username: user.username,
    email: user.email,
    token: token,
    userId: user.id,
  });
});

userRouter.get("/me", isAuthenticated, async (req, res) => {
  return res.status(200).json({
    username: req.user.username,
    email: req.user.email,
    picture: req.user.picture,
    userId: req.user.id,
  });
});

const mailerSend = new MailerSend({
  apiKey: process.env.MAIL_API_KEY,
});

userRouter.post("/email", async (req, res) => {
  try {
    const member = req.body;

    const user = await User.findOne({
      where: {
        id: member.id,
      },
    });

    const sentFrom = new Sender(
      "MS_C3RpDC@trial-7dnvo4drdnrg5r86.mlsender.net",
      "Midpoint"
    );

    const recipients = [new Recipient(user.email, user.username)];

    const personalization = [
      {
        email: user.email,
        data: {
          name: user.username,
        },
      },
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject("MidPoint Plan Invite")
      .setTemplateId("3z0vklorn9pl7qrx")
      .setPersonalization(personalization);

    await mailerSend.email.send(emailParams);

    return res.status(200).json({ message: "Email sent" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to send email", message: error });
  }
});

userRouter.get("/", isAuthenticated, async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        username: {
          [Op.and]: {
            [Op.not]: req.user.username,
            [Op.iLike]: `${req.query.query}%`,
          },
        },
      },
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
