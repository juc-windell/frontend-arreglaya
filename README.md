# ArreglaYa · Frontend (Proyecto 2)

SPA hecha con **React + Vite + Bootstrap 5 + React Router + Axios** que consume la API REST de Django del Proyecto 1 (mantenimiento del campus).

- Backend: repositorio `backend-arreglaya` (Django REST Framework + MySQL) → **https://github.com/USUARIO/backend-arreglaya**
- Integrantes: Windell Urróz Cortes · Enzo Bejarano Mejías · David Chang Castañeda

## Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 20.19+ o 22.12+ (probado con 22) |
| npm | 10+ |
| Python / MySQL | Los del backend (Python 3.12+, MySQL 8) |

## 1. Levantar el backend (Django)

```bash
cd backend-arreglaya
python -m venv .venv
source .venv/Scripts/activate        # Git Bash en Windows  (Linux/Mac: source .venv/bin/activate)
pip install -r requirements.txt      # incluye django-cors-headers
cp .env.example .env                 # completar SECRET_KEY, DB_*, PASSWORD_USUARIOS_PRUEBA
python manage.py migrate
python manage.py crear_datos_prueba
python manage.py runserver           # http://127.0.0.1:8000
```

## 2. Levantar el frontend (React)

```bash
cd frontend-arreglaya
npm install
cp .env.example .env                 # VITE_API_URL=http://127.0.0.1:8000/api
npm run dev                          # http://localhost:5173
```

Otros comandos: `npm run build` (compila a `dist/`), `npm run preview`, `npm run lint`.

## Configuración CORS

El frontend (`http://localhost:5173`) y la API (`http://127.0.0.1:8000`) son orígenes distintos, así que el navegador bloquea las peticiones si Django no lo autoriza. El backend usa **django-cors-headers**:

- `corsheaders` en `INSTALLED_APPS` y `corsheaders.middleware.CorsMiddleware` al inicio de `MIDDLEWARE`.
- `CORS_ALLOWED_ORIGINS` se lee del `.env` del backend. Por defecto: `http://localhost:5173,http://127.0.0.1:5173`.
- Si Vite corre en otro puerto, agregar ese origen en el `.env` del backend y reiniciar Django.

Síntoma de CORS mal configurado: el frontend muestra *"No se pudo conectar con la API…"* y la consola del navegador indica *blocked by CORS policy*.

## Variables de entorno

| Variable | Dónde | Ejemplo |
|---|---|---|
| `VITE_API_URL` | `frontend/.env` | `http://127.0.0.1:8000/api` |
| `CORS_ALLOWED_ORIGINS` | `backend/.env` | `http://localhost:5173,http://127.0.0.1:5173` |

El `.env` real **no se sube** (está en `.gitignore`); solo `.env.example`.

## Usuarios de prueba (ficticios)

Los crea `python manage.py crear_datos_prueba`. La contraseña es el valor de `PASSWORD_USUARIOS_PRUEBA` del `.env` del backend (no se publica aquí).

| Usuario | Perfil | Puede |
|---|---|---|
| `admin1` | Administrador | Todo, incluida la eliminación |
| `operador1` | Operador | Ver todo; crear/editar solicitudes y órdenes |
| `consulta1` | Consulta | Solo ver |

## Autenticación y sesión

1. **Login** → `POST /api/token/` con usuario y contraseña; Django devuelve un token real.
2. Con ese token se pide `GET /api/perfil/` (usuario, grupos e `is_superuser`) para saber el rol.
3. Token y perfil se guardan en `localStorage` y se comparten con `AuthContext` (`useAuth()`).
4. El cliente Axios (`src/api/axios.js`) agrega `Authorization: Token <token>` a cada petición.
5. Si cualquier petición responde **401**, se limpia la sesión y se vuelve al login con un aviso.
6. **Logout** → `POST /api/logout/` (extensión del Proyecto 2): **el token se revoca en el servidor** (se borra de la tabla `authtoken_token`); luego se limpia el navegador. Si el servidor no responde, igual se limpia la sesión local y se avisa que el token no pudo revocarse.

> Limitación: DRF TokenAuthentication usa **un token por usuario**. Si el mismo usuario tiene sesión en dos navegadores (o en Postman), cerrar sesión en uno invalida el token en todos. Los tokens no expiran por tiempo.

## Permisos

La autorización real la aplica Django (`usuarios/permisos.py`). El frontend solo **adapta** la interfaz (oculta botones según el rol, en `src/utils/permisos.js`). Ver [`docs/matriz_permisos.md`](docs/matriz_permisos.md).

## Estructura

```
src/
├── api/            axios.js (cliente único + interceptores) · errores.js (400/401/403/404/409/red)
├── context/        AuthContext.jsx (AuthProvider) · sesion.js (objeto de contexto)
├── hooks/          useAuth · useConsulta (carga/error) · useMensajeRuta (avisos de éxito)
├── services/       authService · dashboardService · edificioService · espacioService · …
├── utils/          permisos.js (matriz de roles) · modulos.js (menú y accesos)
├── components/     Layout · Navbar · Sidebar · ProtectedRoute · dashboard/ · espacios/
└── pages/          Login · Dashboard · Edificios · Espacios (+ detalle y formularios) · 403 · 404
```

## Módulos y responsables

| Módulo | Pantallas | CRUD | Responsable |
|---|---|---|---|
| Espacios | Edificios y Espacios | Completo (ambos) | Persona 1 |
| Técnicos | Técnicos | Completo | Persona 2 |
| Materiales | Materiales | Completo | Persona 2 |
| Solicitudes | Solicitudes | Según reglas del backend | Persona 3 |
| Órdenes | Órdenes | Sin eliminación (409: se conservan como historial) | Persona 3 |

## Ampliaciones del backend para el Proyecto 2

Documentadas en el backend (`docs/extensiones_proyecto2.md`): CORS, `POST /api/logout/`, `is_superuser` en `/api/perfil/`, `edificio_nombre` y filtros `?edificio=` / `?tipo=` en `/api/espacios/`. No se debilitó ninguna regla de negocio ni de seguridad; se agregaron 5 pruebas automatizadas.

## Limitaciones conocidas

- Edificios, espacios y técnicos no están paginados en la API (devuelven la lista completa); la paginación se usa en solicitudes, órdenes y materiales.
- Un token por usuario (ver Autenticación).
- El token se guarda en `localStorage`, aceptable para el curso; en producción convendría una cookie `HttpOnly`.
