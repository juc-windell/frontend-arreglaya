import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { interpretarError } from '../api/errores'
import EstadoListado from '../components/espacios/EstadoListado'
import ModalEliminar from '../components/espacios/ModalEliminar'
import { useAuth } from '../hooks/useAuth'
import { useConsulta } from '../hooks/useConsulta'
import { useMensajeRuta } from '../hooks/useMensajeRuta'
import { listarEdificios } from '../services/edificioService'
import { eliminarEspacio, listarEspacios, TIPOS_ESPACIO, textoTipo } from '../services/espacioService'

// =============================================================================
// Listado de espacios con filtros combinables resueltos por el SERVIDOR:
//   GET /api/espacios/?edificio=<id>&tipo=<TIPO>
// Los filtros viven en la URL (?edificio=1&tipo=AULA) para poder compartirla.
// =============================================================================
export default function Espacios() {
  const { puede } = useAuth()
  const [parametros, setParametros] = useSearchParams()
  const filtroEdificio = parametros.get('edificio') || ''
  const filtroTipo = parametros.get('tipo') || ''

  // Edificios para el selector del filtro (una sola vez)
  const consultaEdificios = useConsulta(listarEdificios)
  const edificios = consultaEdificios.datos ?? []

  // Cada cambio de filtro vuelve a consultar la API
  const { datos, cargando, error, recargar } = useConsulta(
    () => listarEspacios({ edificio: filtroEdificio, tipo: filtroTipo }),
    [filtroEdificio, filtroTipo],
  )
  const espacios = datos ?? []

  const [exito, setExito] = useMensajeRuta()
  const [errorAccion, setErrorAccion] = useState('')
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  function cambiarFiltro(evento) {
    const { name, value } = evento.target
    const nuevos = new URLSearchParams(parametros)
    if (value) nuevos.set(name, value)
    else nuevos.delete(name)
    setParametros(nuevos)
  }

  async function confirmarEliminacion() {
    setEliminando(true)
    setErrorAccion('')
    setExito('')
    try {
      await eliminarEspacio(aEliminar.id)
      setExito(`Espacio "${aEliminar.nombre}" eliminado.`)
      recargar()
    } catch (err) {
      // 409: el espacio tiene solicitudes asociadas
      setErrorAccion(interpretarError(err).mensaje)
    } finally {
      setEliminando(false)
      setAEliminar(null)
    }
  }

  const hayFiltros = Boolean(filtroEdificio || filtroTipo)
  const consulta = new URLSearchParams()
  if (filtroEdificio) consulta.set('edificio', filtroEdificio)
  if (filtroTipo) consulta.set('tipo', filtroTipo)
  const rutaConsulta = `GET /api/espacios/${hayFiltros ? `?${decodeURIComponent(consulta.toString())}` : ''}`

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="h3 mb-1">
            <i className="bi bi-door-open me-2" />
            Espacios
          </h1>
          <p className="text-body-secondary mb-0">Aulas, laboratorios, oficinas y demás espacios por edificio.</p>
        </div>
        {puede('espacios', 'crear') && (
          <Link to={`/espacios/nuevo${filtroEdificio ? `?edificio=${filtroEdificio}` : ''}`} className="btn btn-primary">
            <i className="bi bi-plus-lg me-1" /> Nuevo espacio
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

      {/* Filtros combinables (se aplican en Django, no en el navegador) */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-5">
              <label htmlFor="filtro-edificio" className="form-label small mb-1">
                <i className="bi bi-funnel me-1" />
                Edificio
              </label>
              <select
                id="filtro-edificio"
                name="edificio"
                className="form-select"
                value={filtroEdificio}
                onChange={cambiarFiltro}
              >
                <option value="">Todos los edificios</option>
                {edificios.map((edificio) => (
                  <option key={edificio.id} value={edificio.id}>
                    {edificio.codigo} · {edificio.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label htmlFor="filtro-tipo" className="form-label small mb-1">
                Tipo
              </label>
              <select id="filtro-tipo" name="tipo" className="form-select" value={filtroTipo} onChange={cambiarFiltro}>
                <option value="">Todos los tipos</option>
                {TIPOS_ESPACIO.map((tipo) => (
                  <option key={tipo.valor} value={tipo.valor}>
                    {tipo.texto}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3 d-grid">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setParametros({})}
                disabled={!hayFiltros}
              >
                Limpiar filtros
              </button>
            </div>
          </div>
          <div className="small text-body-tertiary mt-2">
            Filtros aplicados en el servidor: <code>{rutaConsulta}</code>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <EstadoListado
          cargando={cargando}
          error={error?.mensaje}
          vacio={espacios.length === 0}
          mensajeVacio={hayFiltros ? 'Ningún espacio coincide con los filtros.' : 'No hay espacios registrados.'}
          onReintentar={recargar}
        />

        {!cargando && !error && espacios.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Edificio</th>
                  <th>Tipo</th>
                  <th className="text-center">Piso</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {espacios.map((espacio) => (
                  <tr key={espacio.id}>
                    <td>
                      <Link to={`/espacios/${espacio.id}`} className="fw-semibold">
                        {espacio.nombre}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/edificios/${espacio.edificio}`} className="link-body-emphasis">
                        {espacio.edificio_nombre}
                      </Link>
                    </td>
                    <td>
                      <span className="badge text-bg-info-subtle text-info-emphasis border border-info-subtle">
                        {textoTipo(espacio.tipo)}
                      </span>
                    </td>
                    <td className="text-center">{espacio.piso}</td>
                    <td className="tabla-acciones text-end">
                      <div className="btn-group btn-group-sm">
                        <Link to={`/espacios/${espacio.id}`} className="btn btn-outline-secondary" title="Ver detalle">
                          <i className="bi bi-eye" />
                        </Link>
                        {puede('espacios', 'editar') && (
                          <Link to={`/espacios/${espacio.id}/editar`} className="btn btn-outline-primary" title="Editar">
                            <i className="bi bi-pencil" />
                          </Link>
                        )}
                        {puede('espacios', 'eliminar') && (
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            title="Eliminar"
                            onClick={() => setAEliminar(espacio)}
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
        <p className="small text-body-tertiary mt-2 mb-0">{espacios.length} espacio(s) encontrados.</p>
      )}

      <ModalEliminar
        abierto={Boolean(aEliminar)}
        titulo="Eliminar espacio"
        procesando={eliminando}
        onCancelar={() => setAEliminar(null)}
        onConfirmar={confirmarEliminacion}
      >
        ¿Desea eliminar el espacio <strong>{aEliminar?.nombre}</strong> ({aEliminar?.edificio_nombre})?
        <div className="small text-body-secondary mt-2">
          Si el espacio tiene solicitudes asociadas, el servidor no permitirá eliminarlo (409).
        </div>
      </ModalEliminar>
    </>
  )
}
