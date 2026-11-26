import { useState } from 'react'
export default function RegistrarMateriales({ ordenId, materiales = [], guardar, cancelar, procesando = false, campos = {} }) {
  const [material, setMaterial] = useState('')
  const [cantidad, setCantidad] = useState(1)
  function enviar(e) { e.preventDefault(); if (material && Number.isInteger(Number(cantidad)) && Number(cantidad) > 0) guardar({ material: Number(material), cantidad: Number(cantidad) }) }
  return <form className="card card-body mt-3" onSubmit={enviar}>
    <h3 className="h5">Registrar consumo – orden #{ordenId}</h3>
    <div className="mb-3"><label htmlFor="uso-material" className="form-label">Material activo</label>
      <select className="form-select" id="uso-material" required value={material} onChange={e => setMaterial(e.target.value)}>
        <option value="">Seleccione material</option>
        {materiales.filter(x => x.activo && x.stock_actual > 0).map(x => <option key={x.id} value={x.id}>{x.codigo} · {x.nombre} (stock: {x.stock_actual})</option>)}
      </select>{campos.material && <small className="text-danger">{campos.material}</small>}</div>
    <div className="mb-3"><label htmlFor="uso-cantidad" className="form-label">Cantidad utilizada</label>
      <input id="uso-cantidad" className="form-control" type="number" min="1" step="1" required value={cantidad} onChange={e => setCantidad(e.target.value)}/>
      {campos.cantidad && <small className="text-danger">{campos.cantidad}</small>}</div>
    <div className="d-flex gap-2"><button disabled={procesando} className="btn btn-primary">Registrar</button><button type="button" className="btn btn-outline-secondary" onClick={cancelar}>Cancelar</button></div>
  </form>
}
