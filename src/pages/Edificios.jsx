import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { interpretarError } from '../api/errores'
import EstadoListado from '../components/espacios/EstadoListado'
import ModalEliminar from '../components/espacios/ModalEliminar'
import { useAuth } from '../hooks/useAuth'
import { useConsulta } from '../hooks/useConsulta'
import { useMensajeRuta } from '../hooks/useMensajeRuta'
import { eliminarEdificio, listarEdificios } from '../services/edificioService'
import { listarEspacios } from '../services/espacioService'

// =============================================================================
// Listado de edificios con acciones segun el perfil
// =============================================================================
export default function Edificios() {
  const { puede } = useAuth()
  // Se piden en paralelo; los espacios sirven para contar los de cada edificio
  const { datos, cargando, error, recargar } = useConsulta(() =>
    Promise.all([listarEdificios(), listarEspacios()]),
  )
  const edificios = datos?.[0] ?? []
  const espacios = datos?.[1]
  const [exito, setExito] = useMensajeRuta()
  const [errorAccion, setErrorAccion] = useState('')
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  // { idEdificio: cantidadDeEspacios }
  const espaciosPorEdificio = useMemo(() => {
    const conteo = {}
    ;(espacios ?? []).forEach((espacio) => {
      conteo[espacio.edificio] = (conteo[espacio.edificio] || 0) + 1
    })
    return conteo
  }, [espacios])

  async function confirmarEliminacion() {
    setEliminando(true)
    setErrorAccion('')
    setExito('')
    try {
      await eliminarEdificio(aEliminar.id)
      setExito(`Edificio "${aEliminar.nombre}" eliminado.`)
      recargar() // la tabla se vuelve a consultar en el servidor
    } catch (err) {
      // 409: tiene espacios asociados; 403: sin permiso
      setErrorAccion(interpretarError(err).mensaje)
    } finally {
      setEliminando(false)
      setAEliminar(null)
    }
  }

  const puedeCrear = puede('edificios', 'crear')

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="h3 mb-1">
            <i className="bi bi-building me-2" />
            Edificios
          </h1>
          <p className="text-body-secondary mb-0">Edificios del campus registrados en la API.</p>
        </div>
        {puedeCrear && (
          <Link to="/edificios/nuevo" className="btn btn-primary">
            <i className="bi bi-plus-lg me-1" /> Nuevo edificio
          </Link>
        )}
      </div>

      {exito && (
        <div className="alert alert-success alert-dismissible" role="status">
          <i className="bi bi-check-circle me-2" />
          {exito}
          <button type="button" className="btn-close" onClick={() => setExito('')} aria-label="Cerrar" />
        </div>
      )}
      {errorAccion && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          <i className="bi bi-x-circle me-2" />
          {errorAccion}
          <button type="button" className="btn-close" onClick={() => setErrorAccion('')} aria-label="Cerrar" />
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <EstadoListado
          cargando={cargando}
          error={error?.mensaje}
          vacio={edificios.length === 0}
          mensajeVacio="No hay edificios registrados."
          onReintentar={recargar}
          accionVacio={
            puedeCrear && (
              <Link to="/edificios/nuevo" className="btn btn-sm btn-primary">
                Registrar el primero
              </Link>
            )
          }
        />

        {!cargando && !error && edificios.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th className="text-center">Espacios</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {edificios.map((edificio) => (
                  <tr key={edificio.id}>
                    <td>
                      <span className="badge text-bg-light border">{edificio.codigo}</span>
                    </td>
                    <td>
                      <Link to={`/edificios/${edificio.id}`} className="fw-semibold">
                        {edificio.nombre}
                      </Link>
                    </td>
                    <td>
                      {edificio.activo ? (
                        <span className="badge text-bg-success">Activo</span>
                      ) : (
                        <span className="badge text-bg-secondary">Inactivo</span>
                      )}
                    </td>
                    <td className="text-center">
                      <Link to={`/espacios?edificio=${edificio.id}`} title="Ver sus espacios">
                        {espaciosPorEdificio[edificio.id] || 0}
                      </Link>
                    </td>
                    <td className="tabla-acciones text-end">
                      <div className="btn-group btn-group-sm">
                        <Link to={`/edificios/${edificio.id}`} className="btn btn-outline-secondary" title="Ver detalle">
                          <i className="bi bi-eye" />
                        </Link>
                        {puede('edificios', 'editar') && (
                          <Link to={`/edificios/${edificio.id}/editar`} className="btn btn-outline-primary" title="Editar">
                            <i className="bi bi-pencil" />
                          </Link>
                        )}
                        {puede('edificios', 'eliminar') && (
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            title="Eliminar"
                            onClick={() => setAEliminar(edificio)}
                          >
                            <i className="bi bi-trash" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!cargando && !error && (
        <p className="small text-body-tertiary mt-2 mb-0">
          {edificios.length} edificio(s) · <code>GET /api/edificios/</code>
        </p>
      )}

      <ModalEliminar
        abierto={Boolean(aEliminar)}
        titulo="Eliminar edificio"
        procesando={eliminando}
        onCancelar={() => setAEliminar(null)}
        onConfirmar={confirmarEliminacion}
      >
        ¿Desea eliminar el edificio <strong>{aEliminar?.nombre}</strong>? Esta acción no se puede deshacer.
        <div className="small text-body-secondary mt-2">
          Si el edificio tiene espacios asociados, el servidor no permitirá eliminarlo (409).
        </div>
      </ModalEliminar>
    </>
  )
}
