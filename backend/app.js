import express from "express";
import bodyParser from "body-parser";
import { sequelize } from "./datasource.js";
import { registerIOListeners } from "./socket.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { webhookRouter } from "./routers/webhookRouter.js";
import { userRouter } from "./routers/userRouter.js";
import { googleOAuthRouter } from "./routers/oauthRouter.js";
import { planRouter } from "./routers/planRouter.js";
import { routesRouter } from "./routers/routeRouter.js";
import { emailRouter } from "./routers/emailRouter.js";

export const app = express();
const PORT = process.env.PORT;

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173", // Only allow requests from this origin,
    credentials: true,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("static"));

try {
  await sequelize.authenticate();
  await sequelize.sync({ alter: { drop: false } });
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

registerIOListeners(io);

app.use(function (req, res, next) {
  req.io = io;
  next();
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/users", userRouter);
app.use("/api/oauth", googleOAuthRouter);
app.use("/api/plans", planRouter);
app.use("/api/routes", routesRouter);
app.use("/ms/webhook", webhookRouter);
app.use("/api/emails", emailRouter);

app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

httpServer.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
