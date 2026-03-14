import { useState, useEffect } from "react";
import RankingTable from "./components/RankingTable.jsx";
import GameBoard from "./components/GameBoard.jsx";
import { getBackendData } from "./services/api.js";

/**
 * PERSONA 4: App principal que integra todo
 * TODO: Agregar manejo de errores y loading states
 */
export default function App() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[App] Obteniendo datos del ranking...");
        const data = await getBackendData();
        setRanking(data);
      } catch (err) {
        console.error("[App] Error al cargar ranking:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", color: "#fff", background: "#1a1a1a", minHeight: "100vh" }}>
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ color: "#f5c518" }}>🎯 Proyecto - Frontend & Backend</h1>
        <p style={{ color: "#aaa" }}>Conexión React + Express + Socket.io</p>
      </header>

      {loading && <p style={{ textAlign: "center" }}>⏳ Cargando datos...</p>}
      {error && <p style={{ textAlign: "center", color: "#ff6b6b" }}>❌ Error: {error}</p>}

      <GameBoard />
      <RankingTable ranking={ranking} />

      <footer style={{ marginTop: "40px", textAlign: "center", color: "#666", fontSize: "12px" }}>
        <p>Backend URL: {import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}</p>
      </footer>
    </div>
  );
}
