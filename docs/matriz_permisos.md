# Matriz de perfiles y permisos · ArreglaYa

Responsable: Persona 1. La regla real está en el backend (`usuarios/permisos.py`); el frontend la replica en `src/utils/permisos.js` solo para mostrar u ocultar acciones.

## Perfiles

| Recurso | Administrador | Operador | Consulta |
|---|---|---|---|
| Edificios, Espacios | Ver, crear, editar, eliminar | Ver | Ver |
| Técnicos, Materiales | Ver, crear, editar, eliminar | Ver | Ver |
| Solicitudes, Órdenes | Ver, crear, editar, eliminar* | Ver, crear, editar | Ver |
| Registrar materiales en una orden | Sí | Sí | No |

\* Las órdenes nunca se eliminan: `DELETE /api/ordenes/{id}/` responde **409** (historial).

## Cómo se aplica en cada capa

| Capa | Qué hace | Dónde |
|---|---|---|
| Django (autoridad) | Sin token → **401**. Con token sin permiso → **403**. | `SoloAdministradorModifica`, `OperadorGestiona` |
| Ruta privada | Sin sesión → redirige a `/login` | `ProtectedRoute.jsx` |
| Interfaz | Oculta "Nuevo", "Editar", "Eliminar" si el rol no puede | `useAuth().puede(recurso, accion)` |
| Formularios | Si se entra por URL sin permiso, avisa y deja enviar para demostrar el 403 del servidor | `AvisoPermiso.jsx` |
| Errores | 401 → cierra sesión y vuelve al login; 403 → mensaje "No tiene permisos (403)" | `api/axios.js`, `api/errores.js` |

## Evidencias de accesos (escenarios del módulo Espacios)

| # | Perfil | Acción | Petición | Esperado | Resultado en la interfaz |
|---|---|---|---|---|---|
| P1 | Sin sesión | Abrir `/edificios` | — | Redirección | Login con "Debe iniciar sesión…" |
| P2 | Token inválido | Abrir `/espacios` con token alterado en localStorage | `GET /api/espacios/` | **401** | Vuelve al login: "Su sesión expiró o el token fue revocado (401)" |
| P3 | Administrador | Crear edificio | `POST /api/edificios/` | **201** | "Edificio creado correctamente." |
| P4 | Operador | Ver edificios | `GET /api/edificios/` | **200** | Lista sin botones Nuevo/Editar/Eliminar |
| P5 | Operador | Crear edificio entrando a `/edificios/nuevo` | `POST /api/edificios/` | **403** | "No tiene permisos para realizar esta operación (403)…" |
| P6 | Consulta | Ver espacios | `GET /api/espacios/` | **200** | Lista solo lectura |
| P7 | Consulta | Editar espacio por URL `/espacios/1/editar` | `PUT /api/espacios/1/` | **403** | Mensaje 403 |
| P8 | Administrador | Logout y reutilizar el token viejo (Postman) | `GET /api/perfil/` | **401** | Token revocado |

Capturar cada escenario (pantalla + pestaña *Red/Network* de DevTools mostrando el código).
