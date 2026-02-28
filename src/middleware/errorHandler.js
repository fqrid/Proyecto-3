/**
 * Middleware centralizado de manejo de errores.
 * Captura errores lanzados con next(error) en controladores y rutas.
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Error interno del servidor";

    console.error(`[Error] ${req.method} ${req.path} – ${message}`);
    if (process.env.NODE_ENV !== "production") {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};

export default errorHandler;
