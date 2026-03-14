import { useState } from "react";
import { postToBackend } from "../services/api.js";

/**
 * PERSONA 3: Componente para hacer peticiones POST
 * TODO: Agregar validación de respuesta y mejorar UI
 */
export default function GameBoard() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Ejemplo de datos para enviar
      const testData = {
        usuarioId: 1,
        sessionId: "test-session",
        respuesta: "opcion-a",
      };

      const result = await postToBackend(testData);
      setResponse(result);
      console.log("[GameBoard] Respuesta recibida:", result);
    } catch (err) {
      setError(err.message);
      console.error("[GameBoard] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", marginTop: "20px", border: "1px solid #444" }}>
      <h2 style={{ color: "#f5c518" }}>🎮 Prueba de Conexión</h2>
      
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: loading ? "#666" : "#f5c518",
          color: "#000",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold",
        }}
      >
        {loading ? "⏳ Enviando..." : "📤 Enviar al Backend"}
      </button>

      {error && (
        <div style={{ marginTop: "10px", padding: "10px", background: "#8b0000", color: "#fff" }}>
          ❌ Error: {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: "10px", padding: "10px", background: "#006400", color: "#fff" }}>
          ✅ Respuesta del backend:
          <pre style={{ marginTop: "5px" }}>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
