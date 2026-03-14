import express from "express";
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  cambiarContraseña,
  eliminarUsuario,
} from "../controllers/usuarioController.js";

const router = express.Router();

// Rutas para usuarios
router.get("/", obtenerUsuarios);
router.get("/:id", obtenerUsuarioPorId);
router.post("/", crearUsuario);
router.put("/:id", actualizarUsuario);
router.patch("/:id/cambiar-contraseña", cambiarContraseña);
router.delete("/:id", eliminarUsuario);

export default router;
