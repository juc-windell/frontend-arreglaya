import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CLAVE_TOKEN, registrarManejador401 } from '../api/axios'
import { obtenerPerfil, revocarToken, solicitarToken } from '../services/authService'
import { obtenerRol, puedeRealizar } from '../utils/permisos'
import { AuthContext } from './sesion'

// =============================================================================
// Estado de autenticacion compartido por toda la aplicacion.
// Guarda el token y el perfil en localStorage para que la sesion sobreviva a
// una recarga, y vuelve a validar el token contra /api/perfil/ al iniciar.
// =============================================================================

const CLAVE_USUARIO = 'arreglaya_usuario'

function leerUsuarioGuardado() {
  try {
    const texto = localStorage.getItem(CLAVE_USUARIO)
    return texto ? JSON.parse(texto) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [token, setToken] = useState(() => localStorage.getItem(CLAVE_TOKEN))
  const [usuario, setUsuario] = useState(() => leerUsuarioGuardado())
  const [verificando, setVerificando] = useState(() => Boolean(localStorage.getItem(CLAVE_TOKEN)))
  // Aviso que muestra el login despues de un logout o de un 401
  const [aviso, setAviso] = useState(null)

  // Borra la sesion del navegador (no llama al servidor)
  const limpiarSesion = useCallback((nuevoAviso = null) => {
    localStorage.removeItem(CLAVE_TOKEN)
    localStorage.removeItem(CLAVE_USUARIO)
    setToken(null)
    setUsuario(null)
    setAviso(nuevoAviso)
  }, [])

  // Si cualquier peticion responde 401, se cierra la sesion local
  useEffect(() => {
    registrarManejador401(() => {
      limpiarSesion({
        mensaje: 'Su sesión expiró o el token fue revocado (401). Inicie sesión de nuevo.',
        tipo: 'warning',
      })
      navigate('/login', { replace: true })
    })
    return () => registrarManejador401(null)
  }, [limpiarSesion, navigate])

  // Al cargar la aplicacion se valida el token guardado
  useEffect(() => {
    const tokenGuardado = localStorage.getItem(CLAVE_TOKEN)
    if (!tokenGuardado) return

    let cancelado = false
    obtenerPerfil(tokenGuardado)
      .then((perfil) => {
        if (cancelado) return
        localStorage.setItem(CLAVE_USUARIO, JSON.stringify(perfil))
        setUsuario(perfil)
      })
      .catch(() => {
        // 401 ya lo maneja el interceptor. Si es un fallo de red se conserva
        // la sesion guardada y cada pantalla mostrara el error de conexion.
      })
      .finally(() => {
        if (!cancelado) setVerificando(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  // Login: pide el token a Django y luego el perfil con sus grupos
  const iniciarSesion = useCallback(async (username, password) => {
    const nuevoToken = await solicitarToken(username, password)
    const perfil = await obtenerPerfil(nuevoToken)
    localStorage.setItem(CLAVE_TOKEN, nuevoToken)
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(perfil))
    setToken(nuevoToken)
    setUsuario(perfil)
    setAviso(null)
    return perfil
  }, [])

  // Logout: revoca el token en Django (POST /api/logout/) y limpia el navegador.
  // Si el servidor no responde, la sesion local se limpia de todas formas.
  const cerrarSesion = useCallback(async () => {
    let revocado = true
    try {
      await revocarToken()
    } catch {
      revocado = false
    }
    limpiarSesion(
      revocado
        ? { mensaje: 'Sesión cerrada. El token fue revocado en el servidor.', tipo: 'success' }
        : {
            mensaje: 'Sesión cerrada en este navegador (no se pudo contactar al servidor para revocar el token).',
            tipo: 'warning',
          },
    )
    return revocado
  }, [limpiarSesion])

  const valor = useMemo(() => {
    const rol = obtenerRol(usuario)
    return {
      token,
      usuario,
      rol,
      autenticado: Boolean(token && usuario),
      verificando,
      aviso,
      iniciarSesion,
      cerrarSesion,
      puede: (recurso, accion) => puedeRealizar(rol, recurso, accion),
    }
  }, [token, usuario, verificando, aviso, iniciarSesion, cerrarSesion])

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
