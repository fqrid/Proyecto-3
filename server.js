import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import app from "./src/app.js";
import { initSocket } from "./src/modules/sessions/session.socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Crear servidor HTTP sobre la app Express
const httpServer = createServer(app);

// Adjuntar Socket.io al servidor HTTP
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Inicializar eventos de Socket.io
initSocket(io);

// Conectar a MongoDB y arrancar servidor
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Servidor RobinHoot corriendo en http://localhost:${PORT}`);
    console.log(`Socket.io activo en ws://localhost:${PORT}`);
  });
});
