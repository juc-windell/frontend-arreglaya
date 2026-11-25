import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AccesoDenegado from '../pages/AccesoDenegado'

// =============================================================================
// Protege las rutas privadas.
//  - Sin sesion: redirige a /login y recuerda la pagina que se queria abrir.
//  - Con la prop "roles": si el rol del usuario no esta en la lista, muestra
//    la pantalla 403 (esto es solo de interfaz; Django vuelve a validar).
// Se puede usar como envoltorio de rutas anidadas (<Outlet />) o con children.
// =============================================================================
export default function ProtectedRoute({ roles, children }) {
  const { autenticado, verificando, rol, aviso } = useAuth()
  const location = useLocation()

  if (verificando && !autenticado) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status" />
        <span className="ms-3">Verificando sesión…</span>
      </div>
    )
  }

  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        replace
        state={
          // Tras un logout o un 401 el login ya tiene su propio aviso
          aviso
            ? null
            : {
                desde: location.pathname + location.search,
                mensaje: 'Debe iniciar sesión para acceder a esa página.',
                tipo: 'info',
              }
        }
      />
    )
  }

  if (roles && !roles.includes(rol)) {
    return <AccesoDenegado />
  }

  return children ?? <Outlet />
}
