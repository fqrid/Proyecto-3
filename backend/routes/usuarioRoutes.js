import express from "express";
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  cambiarContraseña,
  eliminarUsuario,
  login,
  registrar,
  perfil,
} from "../controllers/usuarioController.js";
import { verificarToken } from "../middleware/auth.js";

const router = express.Router();

// Rutas de autenticación (público)
router.post("/auth/registrar", registrar);
router.post("/auth/login", login);

// Rutas para usuarios (protegidas)
router.get("/perfil", verificarToken, perfil);
router.get("/", obtenerUsuarios);
router.get("/:id", obtenerUsuarioPorId);
router.post("/", crearUsuario);
router.put("/:id", actualizarUsuario);
router.patch("/:id/cambiar-contraseña", cambiarContraseña);
router.delete("/:id", eliminarUsuario);

export default router;
