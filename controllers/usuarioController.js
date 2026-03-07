import Usuario from "../models/Usuario.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registrar = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const existente = await Usuario.findOne({ email });
    if (existente) return res.status(400).json({ message: "Email ya registrado" });

    const hashed = password ? await bcrypt.hash(password, 10) : undefined;
    const usuario = new Usuario({ nombre, email, password: hashed });
    await usuario.save();

    res.status(201).json({ message: "Usuario creado" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ message: "Credenciales inválidas" });

    const match = password && (await bcrypt.compare(password, usuario.password));
    if (!match) return res.status(400).json({ message: "Credenciales inválidas" });

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const perfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.userId).select("-password");
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
