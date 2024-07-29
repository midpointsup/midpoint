export function registerIOListeners(io) {
  // listeners
  io.on("connection", (socket) => {
    socket.on("join-room", function (roomId) {
      socket.join(roomId);
      socket.emit("joined-room", roomId);
    });

    socket.on("join-user", function (userId) {
      socket.join(userId);
      socket.emit("joined-user", userId);
    });

    socket.on("disconnect", () => {});
  });
}
