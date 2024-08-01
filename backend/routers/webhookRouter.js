import { Router } from "express";

export const webhookRouter = Router();

webhookRouter.post("/", async (req, res) => {
  const event = req.body.type;
  const data = req.body.data;

  switch (event) {
    case "activity.sent":
      req.io.emit("emailSent", { subject: data.email.subject });
      break;
    case "activity.opened":
      req.io.emit("emailOpened", { subject: data.email.subject });
      break;
    default:
      console.log(`Unknown event: ${event}`);
  }

  res.status(200).end();
});
