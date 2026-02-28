# 🦉 RobinHoot – Módulo Partidas y Resultados

Sistema completo de sesiones de juego en tiempo real con Node.js, Express, MongoDB, Socket.io y React.

---

## 📋 Variables de Entorno

Copia `.env.example` a `.env` y completa los valores:

```env
MONGO_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/robinhoot?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

---

## 🚀 Cómo Correr en Windows

### Requisitos

- Node.js 20+
- npm

### Backend

```powershell
cd Proyecto-3
copy .env.example .env
# Editar .env con tu MONGO_URI de Atlas

npm install
npm run dev
```

Verás:

```
MongoDB conectado exitosamente
Servidor RobinHoot corriendo en http://localhost:5000
Socket.io activo en ws://localhost:5000
```

### Frontend (opcional — en otra terminal)

```powershell
cd Proyecto-3/frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`

### Seed (datos de prueba)

```powershell
cd Proyecto-3
npm run seed
```

---

## 🌐 Conectar MongoDB Atlas

1. Crear cluster en [cloud.mongodb.com](https://cloud.mongodb.com)
2. En **Database Access**: crear usuario con contraseña
3. En **Network Access**: agregar `0.0.0.0/0` (desarrollo) o tu IP
4. Copiar la **Connection String** y pegarla como `MONGO_URI` en `.env`

```
mongodb+srv://miusuario:mipassword@cluster0.xxxxx.mongodb.net/robinhoot?retryWrites=true&w=majority
```

---

## 🐳 Ejecutar con Docker

```powershell
cd Proyecto-3

# Asegúrate de tener .env con MONGO_URI configurado
npm run docker
# o directamente:
docker-compose up --build
```

- El backend corre en `http://localhost:5000`
- MongoDB local corre en `mongodb://localhost:27017`
- Para usar **Atlas** en Docker, configura `MONGO_URI` en `.env` con tu URI de Atlas

---

## 📡 Endpoints REST

| Método | Endpoint                      | Descripción        |
| ------- | ----------------------------- | ------------------- |
| POST    | `/api/sessions`             | Crear partida       |
| POST    | `/api/sessions/join`        | Unirse con PIN      |
| POST    | `/api/sessions/:id/start`   | Iniciar partida     |
| POST    | `/api/sessions/:id/answer`  | Registrar respuesta |
| GET     | `/api/sessions/:id/ranking` | Obtener ranking     |
| POST    | `/api/sessions/:id/end`     | Finalizar partida   |

### Ejemplo: Crear partida

```bash
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"juegoId":"juego_001","creadorId":"creador_001"}'
```

Respuesta:

```json
{
  "success": true,
  "data": { "sessionId": "...", "pin": "ABC123", "estado": "CREADA" }
}
```

---

## 🔌 Probar Sockets

### Con Postman (Socket.io)

1. Abrir Postman → New Request → **Socket.IO**
2. URL: `ws://localhost:5000`
3. Conectar y emitir eventos:

**Unirse a sesión:**

```json
Evento: join_session
Body: { "pin": "ABC123", "usuarioId": "u001", "nombre": "Carlos" }
```

**Iniciar sesión:**

```json
Evento: start_session
Body: { "sessionId": "64f..." }
```

**Enviar respuesta:**

```json
Evento: submit_answer
Body: {
  "sessionId": "64f...",
  "participantId": "64f...",
  "preguntaId": "p001",
  "opcionId": "A",
  "correcta": true,
  "tiempoRespuestaMs": 8000
}
```

### Eventos recibidos del servidor

| Evento                 | Descripción                                  |
| ---------------------- | --------------------------------------------- |
| `session_joined`     | Confirmación de unión + datos de sesión    |
| `participant_joined` | Otro participante se unió                    |
| `session_started`    | Sesión iniciada                              |
| `answer_processed`   | Respuesta procesada + puntos ganados          |
| `ranking_updated`    | Ranking actualizado (se emite a toda la sala) |
| `session_ended`      | Sesión finalizada                            |

### Con el Frontend React

Abrir `http://localhost:5173`, ingresar el PIN y nombre. El componente muestra el ranking en tiempo real.

---

## 🧪 Colección Postman

Importar el archivo `RobinHoot_Sessions.postman_collection.json`:

1. Postman → Import → seleccionar el archivo
2. Ejecutar en orden del 1 al 7 (guarda automáticamente `sessionId`, `pin`, `participantId`)

---

## 📁 Estructura del Proyecto

```
Proyecto-3/
├── config/
│   └── db.js                     # Conexión MongoDB
├── src/
│   ├── app.js                    # Express app
│   ├── seed.js                   # Datos de prueba
│   ├── middleware/
│   │   └── errorHandler.js       # Manejador central de errores
│   └── modules/sessions/
│       ├── session.model.js      # Modelo Session
│       ├── participant.model.js  # Modelo Participant
│       ├── answer.model.js       # Modelo Answer
│       ├── result.model.js       # Modelo Result
│       ├── session.service.js    # Lógica de negocio
│       ├── session.controller.js # HTTP controllers
│       ├── session.routes.js     # Rutas Express
│       └── session.socket.js     # Socket.io events
├── frontend/                     # React + Vite
│   ├── src/
│   │   ├── socket.js            # Singleton Socket.io-client
│   │   ├── App.jsx              # UI principal + ranking
│   │   └── main.jsx             # Entry point
│   └── vite.config.js
├── server.js                     # Entrada: HTTP + Socket.io
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── RobinHoot_Sessions.postman_collection.json
```

---

## ⚡ Lógica de Puntaje

```
Si respuesta correcta:
  base     = 1000 pts
  bonus    = ((30000 - tiempoRespuestaMs) / 30000) * 500
  total    = base + bonus  →  máx 1500 pts, mín 1000 pts

Si respuesta incorrecta:
  total    = 0 pts
```
