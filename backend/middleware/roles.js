import Usuario from "../models/Usuario.js";

export const esDocenteOAdmin = async (req, res, next) => {
  try {
    // req.userId viene del middleware verificarToken
    const usuario = await Usuario.findById(req.userId).populate("rolId");
    
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado al verificar rol" });
    }

    // Verificar que el usuario tenga un rol y que sea DOCENTE o ADMIN
    if (!usuario.rolId || (usuario.rolId.nombre !== "DOCENTE" && usuario.rolId.nombre !== "ADMIN")) {
      return res.status(403).json({ message: "Acceso denegado: Se requiere rol de Docente o Administrador" });
    }

    next(); // Pasa al siguiente controlador
  } catch (error) {
    res.status(500).json({ message: "Error interno al verificar los roles", error: error.message });
  }
};
