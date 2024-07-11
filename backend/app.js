import express from "express";
import bodyParser from "body-parser";
import { sequelize } from "./datasource.js";
import { userRouter } from "./routers/user_router.js";
import { googleOAuthRouter } from "./routers/google_oauth_router.js";
import { Server } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { registerIOListeners } from "./socket.js";
import cors from "cors";
import { planRouter } from "./routers/plan_router.js";
import http from "http";
import { routesRouter } from "./routers/routes_router.js";

export const app = express();
const PORT = process.env.PORT;

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  }
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

// Initialize socket server
//export const io = new Server(httpServer);
registerIOListeners(io);

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

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

app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
