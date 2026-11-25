export default function AlertMessage({mensaje, tipo='danger', cerrar}) {
  if(!mensaje) return null;
  return <div role="alert" className={`alert alert-${tipo} d-flex justify-content-between align-items-start`}>
    <span>{mensaje}</span>{cerrar && <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={cerrar}/>}
  </div>;
}
