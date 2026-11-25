import { Link } from 'react-router-dom'
import TarjetaIndicador from '../components/dashboard/TarjetaIndicador'
import { useAuth } from '../hooks/useAuth'
import { useConsulta } from '../hooks/useConsulta'
import { cargarIndicadores } from '../services/dashboardService'
import { MODULOS } from '../utils/modulos'

// =============================================================================
// Pantalla inicial despues del login: indicadores reales y accesos a modulos
// =============================================================================

const COLOR_ESTADO = {
  ABIERTA: 'secondary',
  ASIGNADA: 'info',
  EN_PROCESO: 'warning',
  RESUELTA: 'success',
  CANCELADA: 'dark',
  FINALIZADA: 'success',
}

function Estado({ estado, total }) {
  return (
    <span className={`badge text-bg-${COLOR_ESTADO[estado] || 'secondary'} me-1 mb-1`}>
      {estado.replace('_', ' ')}: {total}
    </span>
  )
}

export default function Dashboard() {
  const { usuario, rol } = useAuth()
  // Se guarda la hora para mostrar cuando se consultaron los datos
  const { datos, cargando, recargar } = useConsulta(async () => ({
    indicadores: await cargarIndicadores(),
    hora: new Date(),
  }))
  const indicadores = datos?.indicadores ?? {}
  const actualizado = datos?.hora

  const consultas = indicadores.consultas
  const bajoStock = consultas?.ok
    ? { ok: true, valor: consultas.valor.bajo_stock.length }
    : consultas
  const porEdificio = indicadores.solicitudesPorEdificio
  const porEstado = consultas?.ok ? consultas.valor.ordenes_por_estado : []

  const tarjetas = [
    { clave: 'edificios', titulo: 'Edificios', icono: 'bi-building', color: 'primary', fuente: 'GET /api/edificios/', enlace: '/edificios' },
    { clave: 'espacios', titulo: 'Espacios', icono: 'bi-door-open', color: 'info', fuente: 'GET /api/espacios/', enlace: '/espacios' },
    { clave: 'tecnicosActivos', titulo: 'Técnicos activos', icono: 'bi-person-check', color: 'success', fuente: 'GET /api/tecnicos/?activo=true', enlace: '/tecnicos' },
    { clave: 'solicitudesAbiertas', titulo: 'Solicitudes abiertas', icono: 'bi-clipboard', color: 'warning', fuente: 'GET /api/solicitudes/?estado=ABIERTA', enlace: '/solicitudes' },
    { clave: 'ordenesEnProceso', titulo: 'Órdenes en proceso', icono: 'bi-tools', color: 'secondary', fuente: 'GET /api/ordenes/?estado=EN_PROCESO', enlace: '/ordenes' },
    { clave: 'bajoStock', titulo: 'Materiales bajo stock mínimo', icono: 'bi-exclamation-triangle', color: 'danger', fuente: 'GET /api/ordenes/consultas/', enlace: '/materiales', resultado: bajoStock },
  ]

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="h3 mb-1">Dashboard</h1>
          <p className="text-body-secondary mb-0">
            Bienvenido, <strong>{usuario?.username}</strong> · perfil {rol}
          </p>
        </div>
        <div className="text-end">
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={recargar} disabled={cargando}>
            <i className={`bi bi-arrow-clockwise ${cargando ? 'spin' : ''}`} /> Actualizar
          </button>
          {actualizado && (
            <div className="small text-body-tertiary mt-1">
              Datos de la API · {actualizado.toLocaleTimeString('es-CR')}
            </div>
          )}
        </div>
      </div>

      {/* Indicadores */}
      <div className="row g-3 mb-4">
        {tarjetas.map((t) => (
          <div key={t.clave} className="col-12 col-sm-6 col-xl-4 col-xxl-2">
            <TarjetaIndicador
              titulo={t.titulo}
              icono={t.icono}
              color={t.color}
              fuente={t.fuente}
              enlace={t.enlace}
              cargando={cargando}
              resultado={t.resultado ?? indicadores[t.clave]}
            />
          </div>
        ))}
      </div>

      {/* Accesos a los cinco modulos */}
      <h2 className="h5 mb-3">Módulos</h2>
      <div className="row g-3 mb-4">
        {MODULOS.map((modulo) => (
          <div key={modulo.clave} className="col-12 col-md-6 col-xl">
            <div className="card h-100 border-0 shadow-sm tarjeta-modulo">
              <div className="card-body">
                <i className={`bi ${modulo.icono} fs-3 text-primary`} />
                <h3 className="h6 mt-2 mb-1">{modulo.titulo}</h3>
                <p className="small text-body-secondary mb-3">{modulo.descripcion}</p>
                <div className="d-flex flex-wrap gap-2">
                  {modulo.enlaces.map((enlace) => (
                    <Link key={enlace.ruta} to={enlace.ruta} className="btn btn-sm btn-outline-primary">
                      {enlace.texto}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reportes del backend */}
      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent d-flex justify-content-between">
              <span className="fw-semibold">Solicitudes por edificio</span>
              <code className="small text-body-tertiary">/api/reportes/solicitudes-por-edificio/</code>
            </div>
            <div className="card-body">
              {cargando && <div className="spinner-border spinner-border-sm text-primary" />}
              {!cargando && !porEdificio?.ok && (
                <div className="text-danger small">No se pudo cargar el reporte.</div>
              )}
              {!cargando && porEdificio?.ok && porEdificio.valor.length === 0 && (
                <div className="text-body-secondary small">Todavía no hay solicitudes registradas.</div>
              )}
              {!cargando && porEdificio?.ok && porEdificio.valor.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Edificio</th>
                        <th className="text-end">Total</th>
                        <th>Por estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {porEdificio.valor.map((fila) => (
                        <tr key={fila.edificio}>
                          <td>{fila.edificio}</td>
                          <td className="text-end fw-semibold">{fila.total}</td>
                          <td>
                            {Object.entries(fila.por_estado).map(([estado, total]) => (
                              <Estado key={estado} estado={estado} total={total} />
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent d-flex justify-content-between">
              <span className="fw-semibold">Órdenes por estado</span>
              <code className="small text-body-tertiary">/api/ordenes/consultas/</code>
            </div>
            <div className="card-body">
              {cargando && <div className="spinner-border spinner-border-sm text-primary" />}
              {!cargando && !consultas?.ok && (
                <div className="text-danger small">No se pudo cargar la consulta.</div>
              )}
              {!cargando && consultas?.ok && porEstado.length === 0 && (
                <div className="text-body-secondary small">Todavía no hay órdenes de trabajo.</div>
              )}
              {!cargando && porEstado.length > 0 && (
                <ul className="list-group list-group-flush">
                  {porEstado.map((fila) => (
                    <li key={fila.estado} className="list-group-item d-flex justify-content-between px-0">
                      <span>{fila.estado.replace('_', ' ')}</span>
                      <span className={`badge rounded-pill text-bg-${COLOR_ESTADO[fila.estado] || 'secondary'}`}>
                        {fila.total}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
