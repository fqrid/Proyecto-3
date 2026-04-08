import express from "express";
import {
  crearJuego,
  obtenerJuegos,
  obtenerJuego,
  actualizarJuego,
  eliminarJuego,
} from "../controllers/juegoController.js";
import { verificarToken } from "../middleware/auth.js";
import { esDocenteOAdmin } from "../middleware/roles.js";

const router = express.Router();

router.get("/", obtenerJuegos);
router.get("/:id", obtenerJuego);
router.post("/", verificarToken, esDocenteOAdmin, crearJuego);
router.put("/:id", verificarToken, esDocenteOAdmin, actualizarJuego);
router.delete("/:id", verificarToken, esDocenteOAdmin, eliminarJuego);

export default router;
