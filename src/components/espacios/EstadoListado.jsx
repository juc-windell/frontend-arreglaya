// =============================================================================
// Estados de un listado: cargando, error (con reintento) y vacio.
// Devuelve null cuando hay datos, para que la pagina pinte su tabla.
// =============================================================================
export default function EstadoListado({ cargando, error, vacio, mensajeVacio, onReintentar, accionVacio }) {
  if (cargando) {
    return (
      <div className="text-center py-5 text-body-secondary">
        <div className="spinner-border text-primary mb-2" role="status" />
        <div>Cargando datos desde la API…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2 m-3">
        <span>
          <i className="bi bi-x-circle me-2" />
          {error}
        </span>
        {onReintentar && (
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={onReintentar}>
            Reintentar
          </button>
        )}
      </div>
    )
  }

  if (vacio) {
    return (
      <div className="text-center py-5 text-body-secondary">
        <i className="bi bi-inbox display-6 d-block mb-2" />
        <div className="mb-3">{mensajeVacio}</div>
        {accionVacio}
      </div>
    )
  }

  return null
}
