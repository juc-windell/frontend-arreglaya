import { Link } from 'react-router-dom'
import { interpretarError } from '../../api/errores'

// =============================================================================
// Tarjeta de un indicador del dashboard.
// "resultado" es { ok, valor } o { ok: false, error } (ver dashboardService)
// "fuente" muestra de que endpoint sale el dato (util en la defensa)
// =============================================================================
export default function TarjetaIndicador({ titulo, icono, color, resultado, cargando, fuente, enlace }) {
  let contenido
  if (cargando) {
    contenido = <span className="placeholder col-4 placeholder-lg" />
  } else if (!resultado?.ok) {
    contenido = (
      <span className="text-danger fs-6" title={resultado && interpretarError(resultado.error).mensaje}>
        No disponible
      </span>
    )
  } else {
    contenido = resultado.valor
  }

  return (
    <div className="card border-0 shadow-sm h-100 tarjeta-indicador">
      <div className="card-body d-flex align-items-center gap-3">
        <div className={`icono rounded-3 d-flex align-items-center justify-content-center bg-${color}-subtle text-${color}-emphasis`}>
          <i className={`bi ${icono}`} />
        </div>
        <div className="min-w-0">
          <div className="fs-3 fw-bold lh-1 placeholder-glow">{contenido}</div>
          <div className="small text-body-secondary mt-1">
            {enlace ? (
              <Link to={enlace} className="link-body-emphasis link-underline-opacity-0">
                {titulo}
              </Link>
            ) : (
              titulo
            )}
          </div>
        </div>
      </div>
      <div className="card-footer bg-transparent border-0 pt-0">
        <code className="small text-body-tertiary">{fuente}</code>
      </div>
    </div>
  )
}
