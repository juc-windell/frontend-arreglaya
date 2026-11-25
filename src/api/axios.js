import axios from 'axios'

// =============================================================================
// Cliente HTTP unico de la aplicacion.
// Todas las paginas y servicios usan este cliente; ninguna repite la URL de la API.
// La URL base se lee de la variable de entorno VITE_API_URL (archivo .env).
// =============================================================================

const URL_POR_DEFECTO = 'http://127.0.0.1:8000/api'

export const API_URL = import.meta.env.VITE_API_URL || URL_POR_DEFECTO

if (!import.meta.env.VITE_API_URL) {
  console.warn(
    `[ArreglaYa] VITE_API_URL no esta definida en .env; se usa ${URL_POR_DEFECTO}`,
  )
}

// Clave con la que se guarda el token en el navegador
export const CLAVE_TOKEN = 'arreglaya_token'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// -----------------------------------------------------------------------------
// Interceptor de solicitud: adjunta el token de Django a cada peticion
// con el formato que espera TokenAuthentication -> "Authorization: Token <token>"
// -----------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(CLAVE_TOKEN)
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

// -----------------------------------------------------------------------------
// Interceptor de respuesta: si Django responde 401 (token invalido, vencido o
// revocado) se avisa al AuthContext para que cierre la sesion local y
// redirija al login. El login mismo se excluye para mostrar su propio error.
// -----------------------------------------------------------------------------
let manejadorNoAutenticado = null

export function registrarManejador401(funcion) {
  manejadorNoAutenticado = funcion
}

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const status = error.response?.status
    const esLogin = error.config?.url?.includes('/token/')

    if (status === 401 && !esLogin && manejadorNoAutenticado) {
      manejadorNoAutenticado()
    }
    return Promise.reject(error)
  },
)

export default api
