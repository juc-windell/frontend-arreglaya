export default function DataTable({columnas,datos,cargando,renderAcciones}) {
  return <div className="table-responsive"><table className="table table-striped table-hover align-middle">
    <thead className="table-light"><tr>{columnas.map(c=><th key={c.clave} scope="col">{c.titulo}</th>)}{renderAcciones&&<th scope="col">Acciones</th>}</tr></thead>
    <tbody>{cargando?<tr><td colSpan={columnas.length+(renderAcciones?1:0)} className="text-center py-4">Cargando registros...</td></tr>:
      datos.length===0?<tr><td colSpan={columnas.length+(renderAcciones?1:0)} className="text-center py-4">No se encontraron registros.</td></tr>:
      datos.map(item=><tr key={item.id}>{columnas.map(c=><td key={c.clave}>{c.render?c.render(item):String(item[c.clave]??'—')}</td>)}{renderAcciones&&<td>{renderAcciones(item)}</td>}</tr>)}
    </tbody></table></div>;
}
