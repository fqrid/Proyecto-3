import Session from "./session.model.js";
import Participant from "./participant.model.js";
import Answer from "./answer.model.js";
import Result from "./result.model.js";

const TIEMPO_MAX_MS = 30000; // 30 segundos máximo por pregunta

/**
 * Genera un PIN único de 6 caracteres alfanuméricos en mayúsculas
 */
const generatePin = async () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pin;
    let exists = true;

    while (exists) {
        pin = Array.from({ length: 6 }, () =>
            chars.charAt(Math.floor(Math.random() * chars.length))
        ).join("");
        exists = await Session.exists({ pin });
    }

    return pin;
};

/**
 * Calcula los puntos ganados por una respuesta
 */
const calcularPuntos = (correcta, tiempoRespuestaMs) => {
    if (!correcta) return 0;

    const base = 1000;
    const tiempoEfectivo = Math.min(tiempoRespuestaMs, TIEMPO_MAX_MS);
    const bonus = Math.floor(
        ((TIEMPO_MAX_MS - tiempoEfectivo) / TIEMPO_MAX_MS) * 500
    );

    return base + bonus;
};

// ─── CREATE SESSION ───────────────────────────────────────────────────────────

export const createSession = async (juegoId, creadorId) => {
    if (!juegoId || !creadorId) {
        const err = new Error("juegoId y creadorId son requeridos");
        err.statusCode = 400;
        throw err;
    }

    const pin = await generatePin();

    const session = await Session.create({ juegoId, creadorId, pin });
    return session;
};

// ─── START SESSION ────────────────────────────────────────────────────────────

export const startSession = async (sessionId) => {
    const session = await Session.findById(sessionId);

    if (!session) {
        const err = new Error("Sesión no encontrada");
        err.statusCode = 404;
        throw err;
    }

    if (session.estado !== "CREADA") {
        const err = new Error(
            `No se puede iniciar una sesión en estado: ${session.estado}`
        );
        err.statusCode = 400;
        throw err;
    }

    session.estado = "ACTIVA";
    session.startedAt = new Date();
    await session.save();

    return session;
};

// ─── JOIN SESSION ─────────────────────────────────────────────────────────────

export const joinSession = async (pin, usuarioId, nombre) => {
    if (!pin || !usuarioId || !nombre) {
        const err = new Error("pin, usuarioId y nombre son requeridos");
        err.statusCode = 400;
        throw err;
    }

    const session = await Session.findOne({ pin: pin.toUpperCase() });

    if (!session) {
        const err = new Error("PIN de sesión inválido");
        err.statusCode = 404;
        throw err;
    }

    if (session.estado === "FINALIZADA") {
        const err = new Error("La sesión ya ha finalizado");
        err.statusCode = 400;
        throw err;
    }

    // Verificar si el usuario ya está en la sesión
    const existing = await Participant.findOne({
        sessionId: session._id,
        usuarioId,
    });

    if (existing) {
        // Reconectar participante
        existing.conectado = true;
        await existing.save();
        return { session, participant: existing };
    }

    const participant = await Participant.create({
        sessionId: session._id,
        usuarioId,
        nombre,
    });

    return { session, participant };
};

// ─── SUBMIT ANSWER ────────────────────────────────────────────────────────────

export const submitAnswer = async ({
    sessionId,
    participantId,
    preguntaId,
    opcionId,
    correcta,
    tiempoRespuestaMs,
}) => {
    if (!sessionId || !participantId || !preguntaId || !opcionId) {
        const err = new Error(
            "sessionId, participantId, preguntaId y opcionId son requeridos"
        );
        err.statusCode = 400;
        throw err;
    }
    if (typeof correcta !== "boolean") {
        const err = new Error("correcta debe ser un booleano");
        err.statusCode = 400;
        throw err;
    }

    const session = await Session.findById(sessionId);
    if (!session) {
        const err = new Error("Sesión no encontrada");
        err.statusCode = 404;
        throw err;
    }
    if (session.estado !== "ACTIVA") {
        const err = new Error("La sesión no está activa");
        err.statusCode = 400;
        throw err;
    }

    const participant = await Participant.findById(participantId);
    if (!participant) {
        const err = new Error("Participante no encontrado");
        err.statusCode = 404;
        throw err;
    }

    const puntosGanados = calcularPuntos(correcta, tiempoRespuestaMs);

    const answer = await Answer.create({
        participantId,
        sessionId,
        preguntaId,
        opcionId,
        correcta,
        tiempoRespuestaMs,
        puntosGanados,
    });

    // Actualizar puntaje acumulado
    participant.puntaje += puntosGanados;
    await participant.save();

    return { answer, puntaje: participant.puntaje };
};

// ─── GET RANKING ──────────────────────────────────────────────────────────────

export const getRanking = async (sessionId) => {
    const session = await Session.findById(sessionId);
    if (!session) {
        const err = new Error("Sesión no encontrada");
        err.statusCode = 404;
        throw err;
    }

    const participants = await Participant.find({ sessionId })
        .sort({ puntaje: -1 })
        .select("usuarioId nombre puntaje conectado");

    return participants.map((p, index) => ({
        posicion: index + 1,
        usuarioId: p.usuarioId,
        nombre: p.nombre,
        puntaje: p.puntaje,
        conectado: p.conectado,
    }));
};

// ─── END SESSION ──────────────────────────────────────────────────────────────

export const endSession = async (sessionId) => {
    const session = await Session.findById(sessionId);

    if (!session) {
        const err = new Error("Sesión no encontrada");
        err.statusCode = 404;
        throw err;
    }

    if (session.estado !== "ACTIVA") {
        const err = new Error(
            `No se puede finalizar una sesión en estado: ${session.estado}`
        );
        err.statusCode = 400;
        throw err;
    }

    // Obtener participantes ordenados por puntaje
    const participants = await Participant.find({ sessionId }).sort({
        puntaje: -1,
    });

    // Generar resultados con posición y resumen de respuestas
    const results = await Promise.all(
        participants.map(async (participant, index) => {
            const answers = await Answer.find({ participantId: participant._id });

            const resumen = answers.map((a) => ({
                preguntaId: a.preguntaId,
                opcionId: a.opcionId,
                correcta: a.correcta,
                tiempoRespuestaMs: a.tiempoRespuestaMs,
                puntosGanados: a.puntosGanados,
            }));

            return Result.create({
                sessionId,
                usuarioId: participant.usuarioId,
                totalPuntos: participant.puntaje,
                posicion: index + 1,
                resumen,
            });
        })
    );

    // Actualizar estado de la sesión
    session.estado = "FINALIZADA";
    session.finishedAt = new Date();
    await session.save();

    return { session, results };
};
