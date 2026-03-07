import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import preguntaRoutes from "./routes/preguntaRoutes.js";
import opcionRespuestaRoutes from "./routes/opcionRespuestaRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.get("/", (req, res) => {
  res.send("API del Proyecto funcionando ✅");
});

app.use("/api/preguntas", preguntaRoutes);
app.use("/api/opciones", opcionRespuestaRoutes);

app.listen(5000, () => {
  console.log("Servidor corriendo en puerto 5000");
});