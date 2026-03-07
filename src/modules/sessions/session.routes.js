import { Router } from "express";
import {
    createSession,
    startSession,
    joinSession,
    submitAnswer,
    getRanking,
    endSession,
} from "./session.controller.js";

const router = Router();

// POST /api/sessions – Crear partida
router.post("/", createSession);

// POST /api/sessions/join – Unirse con PIN (debe ir antes de /:sessionId)
router.post("/join", joinSession);

// POST /api/sessions/:sessionId/start – Iniciar partida
router.post("/:sessionId/start", startSession);

// POST /api/sessions/:sessionId/answer – Registrar respuesta
router.post("/:sessionId/answer", submitAnswer);

// GET /api/sessions/:sessionId/ranking – Ranking en vivo
router.get("/:sessionId/ranking", getRanking);

// POST /api/sessions/:sessionId/end – Finalizar partida
router.post("/:sessionId/end", endSession);

export default router;
