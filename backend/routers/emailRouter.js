import { Router } from "express";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { isAuthenticated } from "../middleware/auth.js";
import { User } from "../models/users.js";

export const emailRouter = Router();

const mailerSend = new MailerSend({
  apiKey: process.env.MAIL_API_KEY,
});

const sentFrom = new Sender(
  "MS_C3RpDC@trial-7dnvo4drdnrg5r86.mlsender.net",
  "Midpoint"
);

emailRouter.post("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.body.userId;

    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

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

emailRouter.post("/invite", isAuthenticated, async (req, res) => {
  try {
    const email = req.body.email;

    const recipients = [new Recipient(email)];

    const personalization = [
      {
        email: email,
        data: {
          email: email,
        },
      },
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject("Join Midpoint!")
      .setTemplateId("pxkjn41kkq6lz781")
      .setPersonalization(personalization);

    await mailerSend.email.send(emailParams);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to send email", message: error });
  }
});
