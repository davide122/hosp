// /pages/api/socket

import { Server } from "socket.io";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket.IO è già in esecuzione");
  } else {
    console.log("Inizializzazione di Socket.IO");
    const io = new Server(res.socket.server, {
      path: "/api/socket",
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("Nuovo client connesso");

      socket.on("disconnect", () => {
        console.log("Client disconnesso");
      });

      // Gestisci eventuali eventi personalizzati qui
    });
  }
  res.end();
};

export default SocketHandler;

export const config = {
  api: {
    bodyParser: false,
  },
};
