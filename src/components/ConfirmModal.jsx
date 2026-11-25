// Modal de confirmación con Bootstrap 5 sin dependencia JS de bootstrap.
export default function ConfirmModal({abierto,titulo='Confirmar eliminación',mensaje,confirmar,cancelar,procesando=false}) {
  if(!abierto) return null;
  return <div className="modal d-block" style={{background:'rgba(0,0,0,.55)'}} role="dialog" aria-modal="true" aria-labelledby="confirmar-p2">
    <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
      <div className="modal-header"><h5 id="confirmar-p2" className="modal-title">{titulo}</h5><button type="button" className="btn-close" onClick={cancelar} disabled={procesando}/></div>
      <div className="modal-body"><p className="mb-0">{mensaje}</p></div>
      <div className="modal-footer"><button type="button" className="btn btn-outline-secondary" onClick={cancelar} disabled={procesando}>Cancelar</button>
        <button type="button" className="btn btn-danger" onClick={confirmar} disabled={procesando}>{procesando?'Eliminando...':'Eliminar'}</button></div>
    </div></div>
  </div>;
}
