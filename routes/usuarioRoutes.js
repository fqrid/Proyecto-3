import express from "express";
import { registrar, login, perfil } from "../controllers/usuarioController.js";
import { verificarToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registrar);
router.post("/login", login);
router.get("/me", verificarToken, perfil);

export default router;
