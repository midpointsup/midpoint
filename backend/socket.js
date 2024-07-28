export function registerIOListeners(io) {
  // listeners
  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("join-room", function (roomId) {
      console.log("joining room", roomId);
      socket.join(roomId);
      socket.emit("joined-room", roomId);
      console.log("socket id is:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
}
