import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";
import bcrypt from "bcryptjs";

// Obtener todos los usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().populate("rolId", "nombre");
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener usuario por ID
export const obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).populate("rolId", "nombre");
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Crear usuario
export const crearUsuario = async (req, res) => {
  const { nombre, email, contraseña, rolId } = req.body;

  try {
    // Validaciones
    if (!nombre || !email || !contraseña || !rolId) {
      return res.status(400).json({ mensaje: "Todos los campos son requeridos" });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El email ya está registrado" });
    }

    // Verificar si el rol existe
    const rol = await Rol.findById(rolId);
    if (!rol) {
      return res.status(404).json({ mensaje: "El rol no existe" });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const contraseñaEncriptada = await bcrypt.hash(contraseña, salt);

    // Crear usuario
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      contraseña: contraseñaEncriptada,
      rolId,
    });

    const usuarioGuardado = await nuevoUsuario.save();
    const usuarioPopulado = await usuarioGuardado.populate("rolId", "nombre");

    res.status(201).json(usuarioPopulado);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Actualizar usuario
export const actualizarUsuario = async (req, res) => {
  try {
    const { nombre, email, rolId } = req.body;

    // Si se actualiza email, verificar que no exista
    if (email) {
      const usuarioExistente = await Usuario.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (usuarioExistente) {
        return res.status(400).json({ mensaje: "El email ya está registrado" });
      }
    }

    // Si se actualiza rol, verificar que exista
    if (rolId) {
      const rol = await Rol.findById(rolId);
      if (!rol) {
        return res.status(404).json({ mensaje: "El rol no existe" });
      }
    }

    const datosActualizar = { nombre, email, rolId };
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      datosActualizar,
      { new: true, runValidators: true }
    ).populate("rolId", "nombre");

    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Cambiar contraseña
export const cambiarContraseña = async (req, res) => {
  try {
    const { contraseñaActual, contraseñaNueva } = req.body;

    if (!contraseñaActual || !contraseñaNueva) {
      return res.status(400).json({ mensaje: "Las contraseñas son requeridas" });
    }

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Verificar contraseña actual
    const contraseñaValida = await bcrypt.compare(
      contraseñaActual,
      usuario.contraseña
    );
    if (!contraseñaValida) {
      return res.status(400).json({ mensaje: "Contraseña actual incorrecta" });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const nuevaContraseña = await bcrypt.hash(contraseñaNueva, salt);

    usuario.contraseña = nuevaContraseña;
    await usuario.save();

    res.json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Eliminar usuario
export const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};
