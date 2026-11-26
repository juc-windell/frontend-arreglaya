import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { interpretarError } from '../api/errores'
import { ordenService } from '../services/ordenService'
import { solicitudService } from '../services/solicitudService'
import { tecnicoService } from '../services/tecnicoService'
import { materialService } from '../services/materialService'
import OrdenForm from '../components/ordenes/OrdenForm'
import RegistrarMateriales from '../components/ordenes/RegistrarMateriales'
import AlertMessage from '../components/AlertMessage'
import Pagination from '../components/Pagination'

async function todasLasPaginas(listar, filtros = {}) {
  let page = 1; const todos = []
  while (page <= 100) {
    const data = await listar({ ...filtros, page })
    if (Array.isArray(data)) return [...todos, ...data]
    todos.push(...(data.results || []))
    if (!data.next) break
    page += 1
  }
  return todos
}
export default function Ordenes() {
  const { puede } = useAuth()
  const [ordenes, setOrdenes] = useState([])
  const [solicitudes, setSolicitudes] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const [materiales, setMateriales] = useState([])
  const [filtros, setFiltros] = useState({ estado: '', tecnico: '' })
  const [pagina, setPagina] = useState(1)
  const [paginas, setPaginas] = useState({})
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [campos, setCampos] = useState({})
  const [formOrden, setFormOrden] = useState(false)
  const [ordenConsumo, setOrdenConsumo] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [version, setVersion] = useState(0)
  const recargar = () => setVersion(v => v + 1)
  useEffect(() => {
    let activo = true
    Promise.all([
      todasLasPaginas(solicitudService.listar), todasLasPaginas(tecnicoService.listar), todasLasPaginas(materialService.listar)
    ]).then(([s,t,m]) => { if(activo) {setSolicitudes(s);setTecnicos(t);setMateriales(m)} })
      .catch(e => { if(activo) setError(interpretarError(e).mensaje) })
    return () => { activo = false }
  }, [version])
  useEffect(() => {
    const ctrl = new AbortController()
    setCargando(true)
    ordenService.listar({ ...Object.fromEntries(Object.entries(filtros).filter(([,v]) => v !== '')), page: pagina }, ctrl.signal)
      .then(data => { if (!ctrl.signal.aborted) {setOrdenes(Array.isArray(data) ? data : data.results || []);setPaginas({count: data.count ?? data.length ?? 0, previous: data.previous, next: data.next})} })
      .catch(e => { if(e.code !== 'ERR_CANCELED' && !ctrl.signal.aborted) {setOrdenes([]);setError(interpretarError(e).mensaje)} })
      .finally(() => {if (!ctrl.signal.aborted) setCargando(false)})
    return () => ctrl.abort()
  }, [filtros, pagina, version])
  async function ejecutar(accion, mensaje) {
    setProcesando(true);setError('');setCampos({});setExito('')
    try {await accion();setExito(mensaje);setFormOrden(false);setOrdenConsumo(null);recargar()}
    catch(e) {const info=interpretarError(e);setError(info.mensaje);setCampos(info.campos)}
    finally {setProcesando(false)}
  }
  function verMateriales(id) {
    setDetalle({ id, cargando: true, datos: [] })
    ordenService.listarMateriales(id).then(datos => setDetalle({id, datos: Array.isArray(datos) ? datos : datos.results || [], cargando: false}))
      .catch(e => {setDetalle(null);setError(interpretarError(e).mensaje)})
  }
  return <div className="container-fluid py-3">
    <div className="d-flex justify-content-between align-items-center mb-3"><h1 className="h3">Órdenes de trabajo</h1>{puede('ordenes', 'crear') && <button className="btn btn-primary" onClick={() => {setCampos({});setFormOrden(true)}}>Asignar orden</button>}</div>
    <AlertMessage mensaje={error} cerrar={() => setError('')}/><AlertMessage mensaje={exito} tipo="success" cerrar={() => setExito('')}/>
    <div className="row g-2 mb-3"><div className="col-md-4"><label htmlFor="orden-estado" className="form-label">Estado</label><select id="orden-estado" className="form-select" value={filtros.estado} onChange={e => {setPagina(1);setFiltros(f => ({...f,estado:e.target.value}))}}><option value="">Todos</option>{['ASIGNADA','EN_PROCESO','FINALIZADA'].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
    <div className="col-md-4"><label htmlFor="orden-tecnico" className="form-label">Técnico</label><select id="orden-tecnico" className="form-select" value={filtros.tecnico} onChange={e => {setPagina(1);setFiltros(f=>({...f,tecnico:e.target.value}))}}><option value="">Todos</option>{tecnicos.map(x=><option key={x.id} value={x.id}>{x.nombre}</option>)}</select></div></div>
    {cargando ? <p role="status">Cargando órdenes…</p> : ordenes.length === 0 ? <p>No hay órdenes para estos filtros.</p> : <div className="table-responsive"><table className="table table-striped table-hover align-middle"><thead><tr><th>Orden</th><th>Solicitud</th><th>Técnico</th><th>Estado</th><th>Asignación</th><th>Acciones</th></tr></thead><tbody>
      {ordenes.map(o=><tr key={o.id}><td>#{o.id}</td><td>#{o.solicitud}</td><td>{tecnicos.find(t=>t.id===o.tecnico)?.nombre || `#${o.tecnico}`}</td><td>{o.estado}</td><td>{o.fecha_asignacion ? new Date(o.fecha_asignacion).toLocaleDateString() : '—'}</td><td><div className="d-flex gap-1 flex-wrap">
        <button className="btn btn-outline-secondary btn-sm" onClick={()=>verMateriales(o.id)}>Ver materiales</button>
        {puede('ordenes','editar') && o.estado==='ASIGNADA' && <button className="btn btn-outline-primary btn-sm" disabled={procesando} onClick={()=>ejecutar(()=>ordenService.editar(o.id,{estado:'EN_PROCESO'}),'Orden iniciada.')}>Iniciar</button>}
        {puede('ordenes','editar') && o.estado==='EN_PROCESO' && <button className="btn btn-outline-success btn-sm" disabled={procesando} onClick={()=>ejecutar(()=>ordenService.editar(o.id,{estado:'FINALIZADA'}),'Orden finalizada y solicitud resuelta.')}>Finalizar</button>}
        {puede('ordenes','editar') && o.estado==='EN_PROCESO' && <button className="btn btn-outline-primary btn-sm" onClick={()=>{setCampos({});setOrdenConsumo(o)}}>Registrar material</button>}
      </div></td></tr>)}
    </tbody></table></div>}
    <Pagination pagina={pagina} anterior={paginas.previous} siguiente={paginas.next} total={paginas.count ?? 0} cambiar={setPagina} deshabilitado={cargando}/>
    {detalle && <div className="card card-body mt-3"><div className="d-flex justify-content-between"><h3 className="h5">Materiales de orden #{detalle.id}</h3><button type="button" className="btn-close" aria-label="Cerrar" onClick={()=>setDetalle(null)}/></div>
      {detalle.cargando ? <p>Cargando…</p> : detalle.datos.length ? <ul>{detalle.datos.map(x=><li key={x.id}>{materiales.find(m=>m.id===x.material)?.nombre || `Material #${x.material}`}: {x.cantidad}</li>)}</ul> : <p>No hay materiales registrados.</p>}</div>}
    {formOrden && <OrdenForm solicitudes={solicitudes} tecnicos={tecnicos} ordenes={ordenes} procesando={procesando} campos={campos} cancelar={()=>setFormOrden(false)} guardar={datos=>ejecutar(()=>ordenService.crear(datos),'Orden creada y técnico asignado.')}/>}
    {ordenConsumo && <RegistrarMateriales ordenId={ordenConsumo.id} materiales={materiales} procesando={procesando} campos={campos} cancelar={()=>setOrdenConsumo(null)} guardar={datos=>ejecutar(()=>ordenService.registrarMaterial(ordenConsumo.id,datos),'Material registrado y descontado del inventario.')}/>}
  </div>
}
