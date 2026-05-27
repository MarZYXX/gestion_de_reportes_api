# API REST - Gestion de Reportes

Servicio web desarrollado con Node.js y Express para la aplicacion Flutter de
reportes ciudadanos. La API valida tokens de Firebase Authentication y usa
Firebase Admin SDK para consultar y actualizar Cloud Firestore.

## Tecnologias

- Node.js y Express.
- REST con respuestas JSON.
- Firebase Admin SDK y Cloud Firestore.
- Firebase Authentication para validar ID Tokens.
- CORS y dotenv.

## Instalacion

```powershell
cd backend
npm install
```

Crea un archivo `.env` local a partir de `.env.example`. No subas credenciales
privadas al repositorio.

## Firebase Admin

En Firebase Console abre `Configuracion del proyecto > Cuentas de servicio` y
genera una clave privada para desarrollo local. Puedes configurar sus valores
en `.env`:

```env
PORT=3000
FIREBASE_PROJECT_ID=gestionincidentes-5f34c
FIREBASE_CLIENT_EMAIL=correo-del-service-account
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Otra alternativa es guardar el JSON en una ruta segura e ignorada por Git y
definir `GOOGLE_APPLICATION_CREDENTIALS` con esa ruta.

## Ejecutar

```powershell
npm run dev
```

o:

```powershell
npm start
```

La URL local predeterminada es `http://localhost:3000/api`.

## Autenticacion

Flutter conserva Firebase Authentication. Despues del login obtiene el ID
Token del usuario y lo envia a la API:

```http
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

La API valida el token con `admin.auth().verifyIdToken(token)`. Para acciones
administrativas consulta `users/{uid}` y requiere `role == "admin"`. El backend
nunca acepta un `userId` o rol enviado por el cliente para conceder permisos.

## Endpoints

| Metodo | Ruta | Descripcion | Rol |
| --- | --- | --- | --- |
| GET | `/api/health` | Comprueba disponibilidad del servicio | Publico |
| GET | `/api/me` | Perfil del usuario autenticado | Autenticado |
| GET | `/api/reportes` | Lista reportes; acepta `severidad`, `estado`, `orden` | Autenticado |
| GET | `/api/reportes/mios` | Lista reportes propios | Autenticado |
| GET | `/api/reportes/:id` | Detalle de reporte | Autenticado |
| POST | `/api/reportes` | Crea reporte pendiente | Autenticado |
| PATCH | `/api/reportes/:id` | Edita reporte propio abierto | Propietario |
| DELETE | `/api/reportes/:id` | Elimina reporte propio | Propietario |
| POST | `/api/reportes/:id/corroborar` | Alterna corroboracion en transaccion | Autenticado |
| GET | `/api/reportes/:id/comentarios` | Consulta comentarios | Autenticado |
| POST | `/api/reportes/:id/comentarios` | Crea comentario propio | Autenticado |
| PATCH | `/api/reportes/:id/comentarios/:comentarioId` | Edita comentario propio | Autor |
| DELETE | `/api/reportes/:id/comentarios/:comentarioId` | Elimina comentario propio | Autor |
| PATCH | `/api/admin/reportes/:id/severidad` | Cambia prioridad | Admin |
| PATCH | `/api/admin/reportes/:id/resolver` | Marca resuelto | Admin |
| PATCH | `/api/admin/reportes/:id/falso` | Marca falso/invalido | Admin |
| DELETE | `/api/admin/reportes/:id` | Elimina cualquier reporte | Admin |
| PATCH | `/api/admin/reportes/:id/comentarios/:comentarioId` | Modera texto de comentario | Admin |
| DELETE | `/api/admin/reportes/:id/comentarios/:comentarioId` | Elimina comentario moderado | Admin |
| GET | `/api/admin/usuarios/:id` | Obtiene ciudadano asociado | Admin |

Filtros permitidos en `GET /api/reportes`:

- `severidad=alta|media|baja`
- `estado=pendiente|resuelto|falso`
- `orden=fecha|corroboraciones`

## Ejemplos JSON

Creacion de reporte:

```http
POST /api/reportes
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "titulo": "Bache en calle principal",
  "descripcion": "Bache profundo frente al parque",
  "severidad": "media",
  "fechaIncidente": "2026-05-27T00:00:00.000Z",
  "horaHora": 16,
  "horaMinuto": 30,
  "ubicacion": { "latitud": 20.0, "longitud": -97.0 },
  "urlsImagenes": []
}
```

Respuesta exitosa:

```json
{
  "success": true,
  "message": "Reporte creado correctamente",
  "data": {
    "id": "identificador",
    "titulo": "Bache en calle principal",
    "estaCompleto": false
  }
}
```

Error de permisos:

```json
{
  "success": false,
  "message": "No tienes permisos administrativos"
}
```

## Reglas De Negocio

- El creador del reporte es el `uid` del token, no un campo del body.
- Los reportes nacen pendientes y sin corroboraciones.
- Un ciudadano solo edita o elimina sus reportes abiertos.
- El servidor alterna corroboraciones y conserva el contador consistente.
- Comentarios se asocian al usuario autenticado.
- Solo administradores cambian severidad operativa, resuelven, invalidan o
  consultan informacion de otros ciudadanos.

## Pruebas Manuales

Sin token:

```powershell
Invoke-RestMethod http://localhost:3000/api/health
Invoke-WebRequest http://localhost:3000/api/reportes
```

La primera solicitud debe responder `200`; la segunda, `401`.

Con un ID Token obtenido desde una sesion de Flutter o Postman:

```powershell
$headers = @{ Authorization = "Bearer <TOKEN>"; "Content-Type" = "application/json" }
Invoke-RestMethod http://localhost:3000/api/reportes -Headers $headers
```

Las pruebas de escritura y administracion requieren una cuenta Firebase real y
un backend configurado con credenciales Firebase Admin.

## Verificacion Ejecutada

El 27 de mayo de 2026 se verifico en local:

- `npm run check`: servidor sin errores de sintaxis.
- `GET /api/health`: respuesta `200` con mensaje `API funcionando`.
- `GET /api/reportes` sin bearer token: rechazo `401`.
- Compilacion Android Flutter y pruebas de serializacion JSON: exitosas.
- Reglas de Firestore publicadas para impedir acceso cliente directo a
  `reportes` y `comentarios`.

Las pruebas CRUD con token valido y la prueba de rechazo a un ciudadano en
rutas `/api/admin` deben ejecutarse al configurar la credencial Firebase Admin
privada y utilizar las cuentas reales de demostracion.

## Despliegue

Para demostracion remota, la API puede publicarse en Cloud Run, Render o
Railway configurando las mismas variables de entorno. En produccion Flutter
debe apuntar a una URL HTTPS.
