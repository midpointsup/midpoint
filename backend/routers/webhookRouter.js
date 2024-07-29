import { Router } from "express";

export const webhookRouter = Router();

webhookRouter.post("/", async (req, res) => {
  const event = req.body.type;
  const data = req.body.data;

  switch (event) {
    case "activity.sent":
      req.io.emit("emailSent", data.email.recipient.email);
      break;
    case "activity.opened":
      req.io.emit("emailOpened", data.email.recipient.email);
      break;
    default:
      console.log(`Unknown event: ${event}`);
  }

  res.status(200).end();
});
