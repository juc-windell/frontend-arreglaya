import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { interpretarError } from '../api/errores'
import EstadoListado from '../components/espacios/EstadoListado'
import ModalEliminar from '../components/espacios/ModalEliminar'
import { useAuth } from '../hooks/useAuth'
import { useConsulta } from '../hooks/useConsulta'
import { useMensajeRuta } from '../hooks/useMensajeRuta'
import {
  eliminarEspacio,
  listarSolicitudesDeEspacio,
  obtenerEspacio,
  textoTipo,
} from '../services/espacioService'

// =============================================================================
// Detalle de un espacio: su edificio y las solicitudes de mantenimiento
// reportadas en el (relacion con el modulo Solicitudes, paginada por la API)
// =============================================================================
const COLOR_ESTADO = {
  ABIERTA: 'secondary',
  ASIGNADA: 'info',
  EN_PROCESO: 'warning',
  RESUELTA: 'success',
  CANCELADA: 'dark',
}

export default function EspacioDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { puede } = useAuth()
  const { datos: espacio, cargando, error } = useConsulta(() => obtenerEspacio(id), [id])
  const [exito, setExito] = useMensajeRuta()
  const [errorAccion, setErrorAccion] = useState('')
  const [confirmar, setConfirmar] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  // Solicitudes del espacio, paginadas por la API (5 por pagina)
  const [pagina, setPagina] = useState(1)
  const consultaSolicitudes = useConsulta(() => listarSolicitudesDeEspacio(id, pagina), [id, pagina])
  const solicitudes = consultaSolicitudes.cargando ? null : consultaSolicitudes.datos
  const errorSolicitudes = consultaSolicitudes.cargando ? '' : consultaSolicitudes.error?.mensaje

  async function eliminar() {
    setEliminando(true)
    setErrorAccion('')
    try {
      await eliminarEspacio(id)
      navigate('/espacios', { state: { exito: `Espacio "${espacio.nombre}" eliminado.` } })
    } catch (err) {
      setErrorAccion(interpretarError(err).mensaje)
      setConfirmar(false)
    } finally {
      setEliminando(false)
    }
  }

  if (cargando) return <EstadoListado cargando />

  if (error) {
    return (
      <div className="card border-0 shadow-sm">
        <EstadoListado error={error.mensaje} />
        <div className="px-3 pb-3">
          <Link to="/espacios" className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-left me-1" /> Volver a espacios
          </Link>
        </div>
      </div>
    )
  }

  const total = consultaSolicitudes.datos?.count ?? 0
  const tamanoPagina = 5 // PAGE_SIZE del backend
  const totalPaginas = Math.max(1, Math.ceil(total / tamanoPagina))

  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/espacios">Espacios</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/edificios/${espacio.edificio}`}>{espacio.edificio_nombre}</Link>
          </li>
          <li className="breadcrumb-item active">{espacio.nombre}</li>
        </ol>
      </nav>

      {exito && (
        <div className="alert alert-success alert-dismissible" role="status">
          <i className="bi bi-check-circle me-2" />
          {exito}
          <button type="button" className="btn-close" onClick={() => setExito('')} aria-label="Cerrar" />
        </div>
      )}
      {errorAccion && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-x-circle me-2" />
          {errorAccion}
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap justify-content-between gap-2">
            <div>
              <h1 className="h3 mb-1">{espacio.nombre}</h1>
              <span className="badge text-bg-info-subtle text-info-emphasis border border-info-subtle">
                {textoTipo(espacio.tipo)}
              </span>
            </div>
            <div className="d-flex gap-2 align-items-start">
              {puede('espacios', 'editar') && (
                <Link to={`/espacios/${id}/editar`} className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-pencil me-1" /> Editar
                </Link>
              )}
              {puede('espacios', 'eliminar') && (
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setConfirmar(true)}>
                  <i className="bi bi-trash me-1" /> Eliminar
                </button>
              )}
            </div>
          </div>
          <dl className="row mb-0 mt-3 small">
            <dt className="col-sm-3 text-body-secondary">Edificio</dt>
            <dd className="col-sm-9">
              <Link to={`/edificios/${espacio.edificio}`}>{espacio.edificio_nombre}</Link>
            </dd>
            <dt className="col-sm-3 text-body-secondary">Piso</dt>
            <dd className="col-sm-9">{espacio.piso === 0 ? '0 (planta baja)' : espacio.piso}</dd>
            <dt className="col-sm-3 text-body-secondary">ID</dt>
            <dd className="col-sm-9 mb-0">{espacio.id}</dd>
          </dl>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Solicitudes de mantenimiento en este espacio</span>
          <span className="badge text-bg-secondary">{total}</span>
        </div>

        {errorSolicitudes && <EstadoListado error={errorSolicitudes} onReintentar={consultaSolicitudes.recargar} />}
        {!errorSolicitudes && !solicitudes && <EstadoListado cargando />}
        {!errorSolicitudes && solicitudes && (
          <>
            <EstadoListado vacio={total === 0} mensajeVacio="No hay solicitudes reportadas en este espacio." />
            {total > 0 && (
              <div className="table-responsive">
                <table className="table table-sm table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Descripción</th>
                      <th>Categoría</th>
                      <th>Prioridad</th>
                      <th>Estado</th>
                      <th>Reportada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.results.map((s) => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td className="text-truncate" style={{ maxWidth: 260 }} title={s.descripcion}>
                          {s.descripcion}
                        </td>
                        <td>{s.categoria}</td>
                        <td>{s.prioridad}</td>
                        <td>
                          <span className={`badge text-bg-${COLOR_ESTADO[s.estado] || 'secondary'}`}>
                            {s.estado.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="small">{new Date(s.fecha_reporte).toLocaleDateString('es-CR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <div className="card-footer bg-transparent d-flex flex-wrap justify-content-between align-items-center gap-2">
          <code className="small text-body-tertiary">
            GET /api/solicitudes/?espacio={id}&amp;page={pagina}
          </code>
          {total > tamanoPagina && (
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={!solicitudes?.previous}
                onClick={() => setPagina((p) => p - 1)}
              >
                Anterior
              </button>
              <span className="btn btn-outline-secondary disabled">
                {pagina} / {totalPaginas}
              </span>
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={!solicitudes?.next}
                onClick={() => setPagina((p) => p + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>

      <ModalEliminar
        abierto={confirmar}
        titulo="Eliminar espacio"
        procesando={eliminando}
        onCancelar={() => setConfirmar(false)}
        onConfirmar={eliminar}
      >
        ¿Desea eliminar el espacio <strong>{espacio.nombre}</strong>?
        {total > 0 && (
          <div className="alert alert-warning small mt-3 mb-0">
            Tiene {total} solicitud(es) asociada(s); el servidor rechazará la eliminación (409).
          </div>
        )}
      </ModalEliminar>
    </>
  )
}
