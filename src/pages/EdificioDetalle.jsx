import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { interpretarError } from '../api/errores'
import EstadoListado from '../components/espacios/EstadoListado'
import ModalEliminar from '../components/espacios/ModalEliminar'
import { useAuth } from '../hooks/useAuth'
import { useConsulta } from '../hooks/useConsulta'
import { useMensajeRuta } from '../hooks/useMensajeRuta'
import { eliminarEdificio, obtenerEdificio } from '../services/edificioService'
import { listarEspacios, textoTipo } from '../services/espacioService'

// =============================================================================
// Detalle de un edificio y sus espacios (relacion Edificio 1 -> N Espacio)
// =============================================================================
export default function EdificioDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { puede } = useAuth()
  const { datos, cargando, error, recargar } = useConsulta(
    () => Promise.all([obtenerEdificio(id), listarEspacios({ edificio: id })]),
    [id],
  )
  const [edificio, espacios] = datos ?? [null, []]
  const [exito, setExito] = useMensajeRuta()
  const [errorAccion, setErrorAccion] = useState('')
  const [confirmar, setConfirmar] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  async function eliminar() {
    setEliminando(true)
    setErrorAccion('')
    try {
      await eliminarEdificio(id)
      navigate('/edificios', { state: { exito: `Edificio "${edificio.nombre}" eliminado.` } })
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
        <EstadoListado error={error.mensaje} onReintentar={error.status === 404 ? null : recargar} />
        <div className="px-3 pb-3">
          <Link to="/edificios" className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-left me-1" /> Volver a edificios
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/edificios">Edificios</Link>
          </li>
          <li className="breadcrumb-item active">{edificio.nombre}</li>
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
              <h1 className="h3 mb-1">{edificio.nombre}</h1>
              <span className="badge text-bg-light border me-2">{edificio.codigo}</span>
              {edificio.activo ? (
                <span className="badge text-bg-success">Activo</span>
              ) : (
                <span className="badge text-bg-secondary">Inactivo</span>
              )}
            </div>
            <div className="d-flex gap-2 align-items-start">
              {puede('edificios', 'editar') && (
                <Link to={`/edificios/${id}/editar`} className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-pencil me-1" /> Editar
                </Link>
              )}
              {puede('edificios', 'eliminar') && (
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setConfirmar(true)}>
                  <i className="bi bi-trash me-1" /> Eliminar
                </button>
              )}
            </div>
          </div>
          <dl className="row mb-0 mt-3 small">
            <dt className="col-sm-3 text-body-secondary">ID</dt>
            <dd className="col-sm-9">{edificio.id}</dd>
            <dt className="col-sm-3 text-body-secondary">Espacios registrados</dt>
            <dd className="col-sm-9 mb-0">{espacios.length}</dd>
          </dl>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Espacios de este edificio</span>
          {puede('espacios', 'crear') && (
            <Link to={`/espacios/nuevo?edificio=${id}`} className="btn btn-sm btn-primary">
              <i className="bi bi-plus-lg me-1" /> Agregar espacio
            </Link>
          )}
        </div>
        <EstadoListado vacio={espacios.length === 0} mensajeVacio="Este edificio todavía no tiene espacios." />
        {espacios.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th className="text-center">Piso</th>
                </tr>
              </thead>
              <tbody>
                {espacios.map((espacio) => (
                  <tr key={espacio.id}>
                    <td>
                      <Link to={`/espacios/${espacio.id}`}>{espacio.nombre}</Link>
                    </td>
                    <td>{textoTipo(espacio.tipo)}</td>
                    <td className="text-center">{espacio.piso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalEliminar
        abierto={confirmar}
        titulo="Eliminar edificio"
        procesando={eliminando}
        onCancelar={() => setConfirmar(false)}
        onConfirmar={eliminar}
      >
        ¿Desea eliminar el edificio <strong>{edificio.nombre}</strong>?
        {espacios.length > 0 && (
          <div className="alert alert-warning small mt-3 mb-0">
            Tiene {espacios.length} espacio(s) asociado(s); el servidor rechazará la eliminación (409).
          </div>
        )}
      </ModalEliminar>
    </>
  )
}
