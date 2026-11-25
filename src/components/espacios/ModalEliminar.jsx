// =============================================================================
// Dialogo de confirmacion antes de eliminar (modal de Bootstrap controlado
// con estado de React, sin el JavaScript de Bootstrap).
// =============================================================================
export default function ModalEliminar({ abierto, titulo, children, procesando, onConfirmar, onCancelar }) {
  if (!abierto) return null

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-exclamation-triangle text-danger me-2" />
                {titulo}
              </h5>
              <button type="button" className="btn-close" onClick={onCancelar} disabled={procesando} aria-label="Cerrar" />
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onCancelar} disabled={procesando}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={onConfirmar} disabled={procesando}>
                {procesando && <span className="spinner-border spinner-border-sm me-2" />}
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  )
}
