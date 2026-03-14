import express from "express";
import {
  crearProducto,
  obtenerProductos,
  obtenerProducto,
  eliminarProducto,
} from "../controllers/productoController.js";

const router = express.Router();

router.post("/", crearProducto);
router.get("/", obtenerProductos);
router.get("/:id", obtenerProducto);
router.delete("/:id", eliminarProducto);

export default router;