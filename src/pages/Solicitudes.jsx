import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { interpretarError } from '../api/errores'
import { solicitudService } from '../services/solicitudService'
import { listarEspacios } from '../services/espacioService'
import SolicitudForm, { CATEGORIAS, PRIORIDADES } from '../components/solicitudes/SolicitudForm'
import AlertMessage from '../components/AlertMessage'
import ConfirmModal from '../components/ConfirmModal'
import Pagination from '../components/Pagination'

const ESTADOS = ['ABIERTA', 'ASIGNADA', 'EN_PROCESO', 'RESUELTA', 'CANCELADA']
const LIMPIO = { estado: '', prioridad: '', categoria: '', espacio: '', ordering: '-fecha_reporte' }
export default function Solicitudes() {
  const { puede } = useAuth()
  const [datos, setDatos] = useState([])
  const [espacios, setEspacios] = useState([])
  const [filtros, setFiltros] = useState(LIMPIO)
  const [pagina, setPagina] = useState(1)
  const [paginas, setPaginas] = useState({ count: 0, previous: null, next: null })
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [campos, setCampos] = useState({})
  const [form, setForm] = useState(null)
  const [eliminar, setEliminar] = useState(null)
  const [version, setVersion] = useState(0)
  const recargar = () => setVersion(v => v + 1)
  useEffect(() => {
    listarEspacios().then(r => setEspacios(Array.isArray(r) ? r : r.results || []))
      .catch(() => setError('No fue posible cargar los espacios del formulario.'))
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    setCargando(true)
    setError('')
    solicitudService.listar({ ...Object.fromEntries(Object.entries(filtros).filter(([,v]) => v !== '')), page: pagina }, controller.signal)
      .then(r => { setDatos(Array.isArray(r) ? r : r.results || []); setPaginas({ count: r.count ?? r.length ?? 0, previous: r.previous, next: r.next }) })
      .catch(e => { if (e.code !== 'ERR_CANCELED' && !controller.signal.aborted) { setDatos([]); setError(interpretarError(e).mensaje) } })
      .finally(() => { if (!controller.signal.aborted) setCargando(false) })
    return () => controller.abort()
  }, [pagina, filtros, version])
  function filtrar(campo, valor) { setPagina(1); setFiltros(v => ({ ...v, [campo]: valor })) }
  async function guardar(datosForm) {
    setProcesando(true); setError(''); setCampos({})
    try {
      if (form.id) await solicitudService.editar(form.id, datosForm)
      else await solicitudService.crear(datosForm)
      setExito(form.id ? 'Solicitud actualizada.' : 'Solicitud creada.'); setForm(null); recargar()
    } catch (e) { const info = interpretarError(e); setError(info.mensaje); setCampos(info.campos) }
    finally { setProcesando(false) }
  }
  async function confirmarEliminar() {
    setProcesando(true); setError('')
    try { await solicitudService.eliminar(eliminar.id); setEliminar(null); setExito('Solicitud eliminada.'); recargar() }
    catch (e) { setError(interpretarError(e).mensaje); setEliminar(null) }
    finally { setProcesando(false) }
  }
  return <div className="container-fluid py-3">
    <div className="d-flex justify-content-between align-items-center mb-3"><h1 className="h3">Solicitudes de mantenimiento</h1>
      {puede('solicitudes', 'crear') && <button className="btn btn-primary" onClick={() => { setCampos({});setError('');setForm({}) }}>Nueva solicitud</button>}</div>
    <AlertMessage mensaje={error} cerrar={() => setError('')}/><AlertMessage mensaje={exito} tipo="success" cerrar={() => setExito('')}/>
    <div className="row g-2 mb-3">
      {[[ 'estado', 'Estado', ESTADOS ], ['prioridad', 'Prioridad', PRIORIDADES], ['categoria', 'Categoría', CATEGORIAS]].map(([clave, titulo, opciones]) =>
        <div className="col-md-3" key={clave}><label className="form-label" htmlFor={`filtro-${clave}`}>{titulo}</label>
        <select id={`filtro-${clave}`} className="form-select" value={filtros[clave]} onChange={e => filtrar(clave, e.target.value)}><option value="">Todos</option>{opciones.map(x => <option key={x} value={x}>{x}</option>)}</select></div>)}
      <div className="col-md-3"><label htmlFor="filtro-espacio" className="form-label">Espacio</label><select id="filtro-espacio" className="form-select" value={filtros.espacio} onChange={e => filtrar('espacio', e.target.value)}><option value="">Todos</option>{espacios.map(x => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select></div>
      <div className="col-md-4"><label className="form-label" htmlFor="ordenar-solicitudes">Ordenamiento</label><select id="ordenar-solicitudes" className="form-select" value={filtros.ordering} onChange={e => filtrar('ordering', e.target.value)}><option value="-fecha_reporte">Más recientes</option><option value="fecha_reporte">Más antiguas</option><option value="-prioridad">Mayor prioridad</option><option value="prioridad">Menor prioridad</option></select></div>
    </div>
    {cargando ? <p role="status">Cargando solicitudes…</p> : datos.length === 0 ? <p>No se encontraron solicitudes.</p> :
      <div className="table-responsive"><table className="table table-striped table-hover align-middle"><thead><tr><th>ID</th><th>Espacio</th><th>Descripción</th><th>Categoría</th><th>Prioridad</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>
        {datos.map(s => <tr key={s.id}><td>#{s.id}</td><td>{s.espacio_nombre || s.espacio}</td><td>{s.descripcion}</td><td>{s.categoria}</td><td>{s.prioridad}</td><td>{s.estado}</td><td>{s.fecha_reporte ? new Date(s.fecha_reporte).toLocaleDateString() : '—'}</td>
          <td><div className="d-flex gap-1 flex-wrap">
            {puede('solicitudes', 'editar') && !['RESUELTA', 'CANCELADA'].includes(s.estado) && <button className="btn btn-outline-primary btn-sm" onClick={() => {setCampos({});setError('');setForm(s)}}>Editar</button>}
            {puede('solicitudes', 'eliminar') && s.estado === 'ABIERTA' && <button className="btn btn-outline-danger btn-sm" onClick={() => setEliminar(s)}>Eliminar</button>}
          </div></td></tr>)}
      </tbody></table></div>}
    <Pagination pagina={pagina} anterior={paginas.previous} siguiente={paginas.next} total={paginas.count} cambiar={setPagina} deshabilitado={cargando}/>
    {form && <SolicitudForm key={form.id || 'nuevo'} inicial={form} espacios={espacios} guardar={guardar} cancelar={() => setForm(null)} procesando={procesando} campos={campos}/>}
    <ConfirmModal abierto={!!eliminar} titulo="Eliminar solicitud" mensaje={`¿Eliminar la solicitud #${eliminar?.id}?`} confirmar={confirmarEliminar} cancelar={() => setEliminar(null)} procesando={procesando}/>
  </div>
}
