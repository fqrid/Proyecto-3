import { Router } from "express";
import {
    getPreguntas,
    getPreguntaById,
    getPreguntasByJuego,
    createPregunta,
    updatePregunta,
    deletePregunta,
} from "../controllers/preguntaController.js";
import { verificarToken } from "../middleware/auth.js";
import { esDocenteOAdmin } from "../middleware/roles.js";

const router = Router();

router.get("/", getPreguntas);
router.get("/:id", getPreguntaById);
router.get("/juego/:juegoId", getPreguntasByJuego);
router.post("/", verificarToken, esDocenteOAdmin, createPregunta);
router.put("/:id", verificarToken, esDocenteOAdmin, updatePregunta);
router.delete("/:id", verificarToken, esDocenteOAdmin, deletePregunta);

export default router;
