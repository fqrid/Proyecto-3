import mongoose from "mongoose";

// Modelo básico de usuario. Se puede extender más adelante según necesidad.
const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es requerido"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
    },
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;
