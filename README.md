# API de Usuarios y Roles

## Estructura del Proyecto

```
Proyecto-3/
├── models/
│   ├── Rol.js
│   └── Usuario.js
├── controllers/
│   ├── rolController.js
│   └── usuarioController.js
├── routes/
│   ├── rolRoutes.js
│   └── usuarioRoutes.js
├── middlewares/
│   └── validacion.js
├── config/
│   └── db.js
├── server.js
├── package.json
├── .env.example
└── README.md
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env` desde `.env.example`:
```bash
MONGO_URI=mongodb://localhost:27017/proyecto3
```

3. Ejecutar en desarrollo:
```bash
npm run dev
```

## Endpoints de la API

### ROLES

#### Obtener todos los roles
- **GET** `/api/roles`
- **Respuesta:**
```json
[
  {
    "_id": "...",
    "nombre": "ADMIN",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

#### Obtener rol por ID
- **GET** `/api/roles/:id`

#### Crear rol
- **POST** `/api/roles`
- **Body:**
```json
{
  "nombre": "ADMIN"
}
```

#### Actualizar rol
- **PUT** `/api/roles/:id`
- **Body:**
```json
{
  "nombre": "DOCENTE"
}
```

#### Eliminar rol
- **DELETE** `/api/roles/:id`

---

### USUARIOS

#### Obtener todos los usuarios
- **GET** `/api/usuarios`
- **Respuesta:**
```json
[
  {
    "_id": "...",
    "nombre": "Juan",
    "email": "juan@example.com",
    "rolId": {
      "_id": "...",
      "nombre": "ESTUDIANTE"
    },
    "fechaRegistro": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

#### Obtener usuario por ID
- **GET** `/api/usuarios/:id`

#### Crear usuario
- **POST** `/api/usuarios`
- **Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "contraseña": "micontraseña123",
  "rolId": "id_del_rol"
}
```
- **Respuesta:** Usuario creado con contraseña encriptada

#### Actualizar usuario
- **PUT** `/api/usuarios/:id`
- **Body:**
```json
{
  "nombre": "Juan Carlos",
  "email": "juancarlos@example.com",
  "rolId": "id_del_rol"
}
```

#### Cambiar contraseña
- **PATCH** `/api/usuarios/:id/cambiar-contraseña`
- **Body:**
```json
{
  "contraseñaActual": "micontraseña123",
  "contraseñaNueva": "micontraseñanueva456"
}
```

#### Eliminar usuario
- **DELETE** `/api/usuarios/:id`

## Características Principales

✅ Modelos con Mongoose
✅ CRUD completo para Roles y Usuarios
✅ Encriptación de contraseñas con bcryptjs
✅ Validación de datos
✅ Relaciones entre modelos (populate)
✅ Manejo de errores
✅ Timestamps automáticos

## Notas

- Las contraseñas se encriptan automáticamente al crear o cambiar
- Los emails deben ser únicos y válidos
- Los roles disponibles son: ADMIN, DOCENTE, ESTUDIANTE
- Todos los usuarios deben tener un rol asignado
