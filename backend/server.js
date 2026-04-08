import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./src/modules/sessions/session.socket.js";

import rolRoutes from "./routes/rolRoutes.js";
import juegoRoutes from "./routes/juegoRoutes.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import productoRoutes from "./routes/productoRoutes.js";

dotenv.config();

// ── Validación de variables de entorno críticas ───────────────────────────────
const VARS_REQUERIDAS = ["MONGO_URI", "JWT_SECRET"];
const varsAusentes = VARS_REQUERIDAS.filter((v) => !process.env[v]);
if (varsAusentes.length > 0) {
  console.error(
    `[ERROR] Faltan variables de entorno obligatorias: ${varsAusentes.join(", ")}`
  );
  console.error("[ERROR] Revisa tu archivo .env. El servidor no puede arrancar.");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Orígenes permitidos para CORS (separados por coma en la variable de entorno)
const ORIGINS_PERMITIDOS = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

const app = express();

// ── Helmet: cabeceras HTTP seguras ────────────────────────────────────────────
// Protege contra XSS, clickjacking, sniffing de contenido, etc.
app.use(helmet());

// ── CORS restrictivo ──────────────────────────────────────────────────────────
// Solo acepta peticiones desde los orígenes del frontend definidos
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (ej: Postman, apps móviles) solo en desarrollo
      if (!origin && process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      if (ORIGINS_PERMITIDOS.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origen no permitido → ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ── Limite de tamaño del body ─────────────────────────────────────────────────
// Evita ataques de payload gigante (p.ej. mandar JSON de 50MB)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use("/api/roles", rolRoutes);
app.use("/api/juegos", juegoRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);

app.get("/", (req, res) => {
  res.json({ message: "RobinHoot API funcionando correctamente 🚀" });
});

// ── Manejo de errores global ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  // Error de CORS
  if (err.message && err.message.startsWith("CORS:")) {
    return res.status(403).json({ message: err.message });
  }
  console.error("[ERROR]", err.stack);
  res.status(500).json({ message: "Error interno del servidor" });
});

// ── Servidor HTTP + Socket.io ─────────────────────────────────────────────────
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ORIGINS_PERMITIDOS,
    methods: ["GET", "POST"],
  },
});

initSocket(io);

// ── Conexión a DB y arranque ──────────────────────────────────────────────────
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`[OK] Servidor corriendo en http://localhost:${PORT}`);
    console.log(`[OK] Socket.io activo en ws://localhost:${PORT}`);
    console.log(`[OK] CORS permitido para: ${ORIGINS_PERMITIDOS.join(", ")}`);
    console.log(`[OK] Entorno: ${process.env.NODE_ENV || "development"}`);
  });
});