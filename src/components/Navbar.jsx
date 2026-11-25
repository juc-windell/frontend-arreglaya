import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { COLOR_ROL } from '../utils/permisos'

// =============================================================================
// Barra superior: marca, boton del menu en moviles, usuario, rol y logout
// =============================================================================
export default function Navbar({ onAbrirMenu }) {
  const { usuario, rol, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [saliendo, setSaliendo] = useState(false)

  // cerrarSesion revoca el token y deja el aviso para el login
  async function manejarLogout() {
    setSaliendo(true)
    await cerrarSesion()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="navbar navbar-dark bg-dark sticky-top px-3 shadow-sm">
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-outline-light btn-sm d-lg-none"
          onClick={onAbrirMenu}
          aria-label="Abrir menú"
        >
          <i className="bi bi-list fs-5" />
        </button>
        <Link to="/" className="navbar-brand fw-semibold d-flex align-items-center gap-2 mb-0">
          <i className="bi bi-wrench-adjustable-circle-fill text-warning" />
          ArreglaYa
        </Link>
      </div>

      <div className="d-flex align-items-center gap-2 gap-sm-3 text-light">
        <span className="d-none d-sm-inline">
          <i className="bi bi-person-circle me-1" />
          {usuario?.username}
        </span>
        <span className={`badge text-bg-${COLOR_ROL[rol] || 'dark'}`} title="Perfil de acceso">
          {rol}
        </span>
        <button
          type="button"
          className="btn btn-outline-light btn-sm"
          onClick={manejarLogout}
          disabled={saliendo}
        >
          {saliendo ? (
            <span className="spinner-border spinner-border-sm" />
          ) : (
            <i className="bi bi-box-arrow-right" />
          )}
          <span className="d-none d-md-inline ms-1">Cerrar sesión</span>
        </button>
      </div>
    </nav>
  )
}
