export function registerIOListeners(io) {
  // listeners
  io.on("connection", (socket) => {

    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
}
