import { useState, useEffect } from "react";
import socket from "./socket.js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// ─── Utilidades HTTP ─────────────────────────────────────────────────────────
const api = {
    post: (path, body) =>
        fetch(`${BACKEND_URL}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }).then((r) => r.json()),
    get: (path) =>
        fetch(`${BACKEND_URL}${path}`).then((r) => r.json()),
};

// ─── Componente Ranking ───────────────────────────────────────────────────────
function RankingTable({ ranking }) {
    if (!ranking.length)
        return <p style={{ color: "#aaa" }}>Aún no hay participantes.</p>;

    return (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr style={{ background: "#333" }}>
                    <th style={th}>#</th>
                    <th style={th}>Nombre</th>
                    <th style={th}>Puntaje</th>
                </tr>
            </thead>
            <tbody>
                {ranking.map((p) => (
                    <tr key={p.usuarioId} style={{ borderBottom: "1px solid #444" }}>
                        <td style={td}>{p.posicion}</td>
                        <td style={td}>{p.nombre}</td>
                        <td style={{ ...td, fontWeight: "bold", color: "#f5c518" }}>
                            {p.puntaje}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

const th = { padding: "10px", textAlign: "left", color: "#eee" };
const td = { padding: "10px", color: "#ddd" };

// ─── App principal ────────────────────────────────────────────────────────────
export default function App() {
    const [connected, setConnected] = useState(false);
    const [status, setStatus] = useState("desconectado");

    // Formulario de unirse
    const [pin, setPin] = useState("");
    const [nombre, setNombre] = useState("");
    const [usuarioId] = useState("user_" + Math.random().toString(36).slice(2, 7));

    // Estado de sesión
    const [sessionData, setSessionData] = useState(null);
    const [ranking, setRanking] = useState([]);
    const [error, setError] = useState("");
    const [log, setLog] = useState([]);

    const addLog = (msg) =>
        setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);

    // ── Escuchar eventos de Socket.io ──────────────────────────────────────────
    useEffect(() => {
        socket.on("connect", () => {
            setConnected(true);
            setStatus("conectado");
            addLog("Socket conectado: " + socket.id);
        });

        socket.on("disconnect", () => {
            setConnected(false);
            setStatus("desconectado");
            addLog("Socket desconectado");
        });

        socket.on("session_joined", (data) => {
            if (data.success) {
                setSessionData(data);
                setError("");
                addLog(`Unido a sesión ${data.sessionId} como ${nombre}`);
            } else {
                setError(data.message);
                addLog("Error al unirse: " + data.message);
            }
        });

        socket.on("participant_joined", (data) => {
            addLog(`Nuevo participante: ${data.nombre}`);
        });

        socket.on("session_started", (data) => {
            addLog("¡Sesión iniciada! " + data.startedAt);
        });

        socket.on("answer_processed", (data) => {
            if (data.success) {
                addLog(
                    `Respuesta: ${data.correcta ? "✓ Correcta" : "✗ Incorrecta"} – +${data.puntosGanados} pts (Total: ${data.puntajeTotal})`
                );
            }
        });

        socket.on("ranking_updated", ({ ranking }) => {
            setRanking(ranking);
            addLog("Ranking actualizado");
        });

        socket.on("session_ended", () => {
            addLog("Sesión finalizada");
        });

        return () => socket.removeAllListeners();
    }, [nombre]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleJoin = (e) => {
        e.preventDefault();
        if (!pin || !nombre) return;
        socket.emit("join_session", { pin: pin.toUpperCase(), usuarioId, nombre });
        addLog(`Intentando unirse con PIN: ${pin}...`);
    };

    const handleStart = () => {
        if (!sessionData?.sessionId) return;
        socket.emit("start_session", { sessionId: sessionData.sessionId });
        addLog("Enviando start_session...");
    };

    const handleFakeAnswer = () => {
        if (!sessionData) return;
        socket.emit("submit_answer", {
            sessionId: sessionData.sessionId,
            participantId: sessionData.participantId,
            preguntaId: "pregunta_demo",
            opcionId: "opcion_A",
            correcta: Math.random() > 0.4,
            tiempoRespuestaMs: Math.floor(Math.random() * 25000) + 1000,
        });
        addLog("Enviando respuesta demo...");
    };

    const handleFetchRanking = async () => {
        if (!sessionData?.sessionId) return;
        const res = await api.get(`/api/sessions/${sessionData.sessionId}/ranking`);
        if (res.success) setRanking(res.data);
        addLog("Ranking obtenido via REST");
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>🦉 RobinHoot – Conexión de Partida</h1>

            {/* Estado del socket */}
            <div style={{ ...styles.badge, background: connected ? "#1a5c2b" : "#5c1a1a" }}>
                Socket: {status} {connected ? "🟢" : "🔴"} | ID: {usuarioId}
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            {!sessionData ? (
                /* ── Formulario de unirse ── */
                <form onSubmit={handleJoin} style={styles.form}>
                    <h2 style={styles.subtitle}>Unirse a Partida</h2>
                    <input
                        style={styles.input}
                        placeholder="PIN (ej: ABC123)"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.toUpperCase())}
                        maxLength={6}
                        required
                    />
                    <input
                        style={styles.input}
                        placeholder="Tu nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                    <button style={styles.btn} type="submit">
                        Unirse
                    </button>
                </form>
            ) : (
                /* ── Panel de sesión ── */
                <div>
                    <div style={styles.sessionInfo}>
                        <strong>Sesión:</strong> {sessionData.sessionId} |{" "}
                        <strong>Juego:</strong> {sessionData.juegoId} |{" "}
                        <strong>Estado:</strong> {sessionData.estado}
                    </div>

                    <div style={styles.actions}>
                        <button style={styles.btn} onClick={handleStart}>
                            ▶ Iniciar Sesión
                        </button>
                        <button style={{ ...styles.btn, background: "#1a5c3b" }} onClick={handleFakeAnswer}>
                            ✏ Enviar Respuesta Demo
                        </button>
                        <button style={{ ...styles.btn, background: "#1a3b5c" }} onClick={handleFetchRanking}>
                            📊 Recargar Ranking (REST)
                        </button>
                    </div>

                    <h2 style={styles.subtitle}>Ranking en Vivo</h2>
                    <RankingTable ranking={ranking} />
                </div>
            )}

            {/* Log de eventos */}
            <h3 style={styles.subtitle}>Log de Eventos Socket</h3>
            <div style={styles.log}>
                {log.length === 0 && <span style={{ color: "#666" }}>Sin eventos aún...</span>}
                {log.map((l, i) => (
                    <div key={i} style={{ color: "#adf", marginBottom: 2 }}>
                        {l}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Estilos inline ───────────────────────────────────────────────────────────
const styles = {
    container: {
        fontFamily: "system-ui, sans-serif",
        maxWidth: "700px",
        margin: "40px auto",
        padding: "24px",
        background: "#1a1a2e",
        color: "#eee",
        borderRadius: "12px",
        boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
    },
    title: { fontSize: "1.8rem", marginBottom: "16px", color: "#f5c518" },
    subtitle: { fontSize: "1.1rem", margin: "20px 0 10px", color: "#ccc" },
    badge: {
        padding: "8px 16px",
        borderRadius: "6px",
        marginBottom: "16px",
        fontSize: "0.85rem",
    },
    form: { display: "flex", flexDirection: "column", gap: "12px" },
    input: {
        padding: "12px",
        borderRadius: "6px",
        border: "1px solid #444",
        background: "#0f0f1b",
        color: "#eee",
        fontSize: "1rem",
    },
    btn: {
        padding: "12px 20px",
        borderRadius: "6px",
        border: "none",
        background: "#f5c518",
        color: "#111",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "0.95rem",
    },
    actions: { display: "flex", gap: "10px", flexWrap: "wrap", margin: "16px 0" },
    sessionInfo: {
        padding: "10px 14px",
        background: "#0f0f1b",
        borderRadius: "6px",
        marginBottom: "12px",
        fontSize: "0.9rem",
    },
    errorBox: {
        background: "#5c0000",
        padding: "10px 14px",
        borderRadius: "6px",
        marginBottom: "12px",
        color: "#ffaaaa",
    },
    log: {
        background: "#0a0a1a",
        padding: "12px",
        borderRadius: "6px",
        height: "180px",
        overflowY: "auto",
        fontSize: "0.82rem",
        fontFamily: "monospace",
    },
};
