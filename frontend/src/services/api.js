// ─── Configuración de API ───────────────────────────────────────────────────────
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * PERSONA 1: Función para obtener el ranking del backend
 * TODO: Agregar manejo de errores y validación de datos
 */
export const getBackendData = async () => {
  console.log(`[API] Solicitando datos de: ${BACKEND_URL}/api/ranking`);
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/ranking`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("[API] Error al obtener datos:", error);
    throw error;
  }
};

/**
 * Función para hacer POST al backend
 */
export const postToBackend = async (data) => {
  console.log(`[API] Enviando POST a: ${BACKEND_URL}/api/game`, data);
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/game`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("[API] Error en POST:", error);
    throw error;
  }
};
