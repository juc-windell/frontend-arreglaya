import { NavLink } from 'react-router-dom'
import { MODULOS } from '../utils/modulos'

// =============================================================================
// Menu lateral. En escritorio (>= lg) queda fijo a la izquierda; en moviles
// funciona como offcanvas de Bootstrap controlado con estado de React.
// =============================================================================
function claseEnlace({ isActive }) {
  return `nav-link d-flex align-items-center gap-2 rounded ${isActive ? 'active' : 'link-body-emphasis'}`
}

export default function Sidebar({ abierto, onCerrar }) {
  return (
    <>
      <aside
        className={`offcanvas-lg offcanvas-start app-sidebar ${abierto ? 'show' : ''}`}
        tabIndex="-1"
        aria-label="Menú principal"
      >
        <div className="offcanvas-header border-bottom d-lg-none">
          <h5 className="offcanvas-title mb-0">Menú</h5>
          <button type="button" className="btn-close" onClick={onCerrar} aria-label="Cerrar" />
        </div>

        <div className="offcanvas-body p-0">
          <nav className="nav nav-pills flex-column w-100 p-3 gap-1">
            <NavLink to="/" end className={claseEnlace} onClick={onCerrar}>
              <i className="bi bi-speedometer2" /> Dashboard
            </NavLink>

            {MODULOS.map((modulo) => (
              <div key={modulo.clave} className="mt-2">
                <div className="small text-uppercase text-body-secondary fw-semibold px-2 mb-1">
                  {modulo.titulo}
                </div>
                {modulo.enlaces.map((enlace) => (
                  <NavLink key={enlace.ruta} to={enlace.ruta} className={claseEnlace} onClick={onCerrar}>
                    <i className={`bi ${enlace.icono}`} /> {enlace.texto}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Fondo oscuro del offcanvas en moviles */}
      {abierto && <div className="offcanvas-backdrop fade show d-lg-none" onClick={onCerrar} />}
    </>
  )
}
