export default function Pagination({pagina,anterior,siguiente,total,cambiar,deshabilitado=false}) {
  const hayAnterior=Boolean(anterior) && pagina>1;
  const haySiguiente=Boolean(siguiente);
  return <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
    <small className="text-muted">Total de registros: {total} · Página {pagina}</small>
    <nav aria-label="Paginación"><div className="btn-group">
      <button className="btn btn-outline-primary" disabled={!hayAnterior||deshabilitado} onClick={()=>cambiar(pagina-1)}>Anterior</button>
      <button className="btn btn-outline-primary" disabled={!haySiguiente||deshabilitado} onClick={()=>cambiar(pagina+1)}>Siguiente</button>
    </div></nav>
  </div>;
}
