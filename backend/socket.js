export function registerIOListeners(io) {
  // listeners
  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
}

// import io from 'socket.io-client';
// const socket = io("http://localhost:3000");
// export default socket;
