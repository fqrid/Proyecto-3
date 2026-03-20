import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./src/modules/sessions/session.socket.js";

import rolRoutes from "./routes/rolRoutes.js";
import juegoRoutes from "./routes/juegoRoutes.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import productoRoutes from "./routes/productoRoutes.js";
import rankingRoutes from "./routes/rankingRoutes.js";
import sessionRoutes from "./src/modules/sessions/session.routes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// RUTAS
app.use("/api/roles", rolRoutes);
app.use("/api/juegos", juegoRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/sessions", sessionRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando correctamente 🚀");
});

// MANEJO DE ERRORES
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Error del servidor" });
});

// SERVIDOR HTTP + SOCKET
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Inicializar eventos de Socket.io
initSocket(io);

// CONEXIÓN A DB Y ARRANQUE
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Socket.io activo en ws://localhost:${PORT}`);
  });
});