# Gestion de Reportes Ciudadanos

Aplicacion Flutter para reportar incidentes municipales, con mapa, evidencia,
corroboraciones, comentarios y panel administrativo.

## Arquitectura de Servicios Web

Antes de esta migracion, el modulo de incidentes consultaba Firestore
directamente desde Flutter:

```text
Flutter -> Firebase Authentication / Cloud Firestore
```

La arquitectura del modulo principal ahora es:

```text
Flutter -> API REST Node.js/Express -> Firebase Admin SDK -> Cloud Firestore
            ^
            | Authorization: Bearer <Firebase ID Token>
Firebase Authentication
```

Firebase se conserva como autenticacion y almacenamiento en nube. La API REST
se incorpora para centralizar autorizacion y reglas de negocio, y para demostrar
el consumo de un servicio web propio desde una aplicacion movil.

## Alcance Migrado

El servicio REST administra:

- Consulta, creacion, detalle, edicion y eliminacion de reportes.
- Corroboraciones mediante transaccion segura.
- Consulta, creacion, edicion y eliminacion de comentarios.
- Cambio de severidad, resolucion e invalidacion por administrador.
- Consulta administrativa de datos del ciudadano asociado al reporte.

Firebase Authentication permanece en Flutter para registro e inicio de sesion.
Las pantallas de perfil conservan temporalmente su acceso directo a `users`, ya
que el modulo evaluado es gestion de incidentes. Las reglas de Firestore
bloquean acceso cliente directo a `reportes` y `comentarios`; esas colecciones
se operan a traves de la API.

## Ejecucion

Consulta [backend/README.md](backend/README.md) para configurar Firebase Admin
y ejecutar la API.

Para ejecutar Flutter contra una API local desde emulador Android:

```powershell
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api
```

Para un celular fisico conectado a la misma red, reemplaza la direccion por la
IP local de la computadora:

```powershell
flutter run --dart-define=API_BASE_URL=http://IP_DE_TU_PC:3000/api
```

En una publicacion real, utiliza una URL HTTPS desplegada para la API.

## Validacion Realizada

Validaciones ejecutadas el 27 de mayo de 2026:

- `npm run check` verifica sintaxis del servidor Node.js.
- El servidor iniciado localmente responde `200` en `GET /api/health`.
- `GET /api/reportes` sin token responde `401`.
- `flutter test --no-pub test\widget_test.dart` pasa las pruebas del contrato
  JSON de `ReporteModel`.
- `flutter build apk --debug --no-pub` compila correctamente la aplicacion.
- Las reglas `firestore.rules` se compilaron y publicaron en el proyecto
  `gestionincidentes-5f34c`.

`flutter analyze --no-pub lib test` no reporta errores de compilacion, aunque
mantiene avisos de estilo/deprecaciones preexistentes en varias pantallas y un
campo de perfil sin uso.

## Imagenes

Para mantener compatibilidad con los reportes existentes, `urlsImagenes`
continua aceptando URLs o evidencia Base64. La migracion recomendada posterior
es subir imagenes a Firebase Storage y conservar solamente URLs en Firestore,
porque un documento Firestore tiene limites de tamano y Base64 aumenta el peso.

## Paso Manual Necesario

Para ejecutar operaciones autenticadas contra Firestore desde la API se debe
configurar localmente una cuenta de servicio Firebase Admin en `backend/.env`
o mediante `GOOGLE_APPLICATION_CREDENTIALS`. La credencial privada no forma
parte del repositorio.

## Evidencias Para Exposicion

1. Mostrar la app Flutter iniciando sesion con Firebase Authentication.
2. Ejecutar `GET /api/health` en Postman o navegador.
3. Crear un reporte desde Flutter y mostrar la solicitud REST en el servidor.
4. Confirmar en Firestore que el documento fue almacenado.
5. Corroborar o comentar desde ciudadano.
6. Ingresar como administrador y resolver o invalidar mediante endpoint protegido.
