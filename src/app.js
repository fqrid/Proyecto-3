import express from "express";
import cors from "cors";
import sessionRoutes from "./modules/sessions/session.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({ message: "RobinHoot API funcionando", version: "1.0.0" });
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use("/api/sessions", sessionRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

// ── Error handler (debe ir al final) ─────────────────────────────────────────
app.use(errorHandler);

export default app;
