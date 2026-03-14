// src/seed.js
// Script de datos de prueba para desarrollo.
// Uso: npm run seed

import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Session from "./modules/sessions/session.model.js";
import Participant from "./modules/sessions/participant.model.js";
import Answer from "./modules/sessions/answer.model.js";
import Result from "./modules/sessions/result.model.js";

dotenv.config();

const seed = async () => {
    await connectDB();

    console.log("Limpiando colecciones...");
    await Promise.all([
        Session.deleteMany({}),
        Participant.deleteMany({}),
        Answer.deleteMany({}),
        Result.deleteMany({}),
    ]);

    console.log("Creando sesión de prueba...");
    const session = await Session.create({
        juegoId: "juego_demo_001",
        creadorId: "creador_001",
        pin: "DEMO01",
        estado: "ACTIVA",
        startedAt: new Date(),
    });

    console.log(`Sesión creada: ${session._id} | PIN: ${session.pin}`);

    const participant1 = await Participant.create({
        sessionId: session._id,
        usuarioId: "usuario_001",
        nombre: "Carlos",
        puntaje: 1350,
    });

    const participant2 = await Participant.create({
        sessionId: session._id,
        usuarioId: "usuario_002",
        nombre: "María",
        puntaje: 1000,
    });

    console.log("Participantes creados:", participant1.nombre, participant2.nombre);

    await Answer.create({
        participantId: participant1._id,
        sessionId: session._id,
        preguntaId: "pregunta_001",
        opcionId: "opcion_A",
        correcta: true,
        tiempoRespuestaMs: 8000,
        puntosGanados: 1350,
    });

    await Answer.create({
        participantId: participant2._id,
        sessionId: session._id,
        preguntaId: "pregunta_001",
        opcionId: "opcion_B",
        correcta: true,
        tiempoRespuestaMs: 15000,
        puntosGanados: 1000,
    });

    console.log("Seed completado exitosamente.");
    console.log(`Puedes usar el PIN: ${session.pin} para unirte.`);
    await mongoose.disconnect();
    process.exit(0);
};

seed().catch((err) => {
    console.error("Error en seed:", err);
    process.exit(1);
});
