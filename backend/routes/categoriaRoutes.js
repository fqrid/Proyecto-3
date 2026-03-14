import express from "express";
import {
  crearCategoria,
  obtenerCategorias,
  obtenerCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "../controllers/categoriaController.js";
import { verificarToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", obtenerCategorias);
router.get("/:id", obtenerCategoria);
router.post("/", verificarToken, crearCategoria);
router.put("/:id", verificarToken, actualizarCategoria);
router.delete("/:id", verificarToken, eliminarCategoria);

export default router;
