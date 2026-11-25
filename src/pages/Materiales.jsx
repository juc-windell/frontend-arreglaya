import {useEffect,useState} from 'react';
import {materialService} from '../services/materialService';
import DataTable from '../components/DataTable';
import AlertMessage from '../components/AlertMessage';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
const vacio={codigo:'',nombre:'',descripcion:'',unidad_medida:'unidad',stock_actual:0,stock_minimo:0,activo:true};
export default function Materiales({esAdministrador=false}) {
 const [datos,setDatos]=useState([]),[total,setTotal]=useState(0),[anterior,setAnterior]=useState(null),[siguiente,setSiguiente]=useState(null);
 const [pagina,setPagina]=useState(1),[buscar,setBuscar]=useState(''),[busqueda,setBusqueda]=useState(''),[activo,setActivo]=useState('');
 const [cargando,setCargando]=useState(true),[guardando,setGuardando]=useState(false),[error,setError]=useState(''),[exito,setExito]=useState('');
 const [form,setForm]=useState(null),[idEditar,setIdEditar]=useState(null),[borrar,setBorrar]=useState(null),[version,setVersion]=useState(0);
 useEffect(()=>{const ac=new AbortController();setCargando(true);setError('');
  materialService.listar({page:pagina,search:busqueda,activo},ac.signal).then(d=>{setDatos(Array.isArray(d?.results)?d.results:Array.isArray(d)?d:[]);setTotal(d?.count??(Array.isArray(d)?d.length:0));setAnterior(d?.previous??null);setSiguiente(d?.next??null);}).catch(e=>{if(e.name!=='AbortError')setError(e.message);}).finally(()=>{if(!ac.signal.aborted)setCargando(false);});
  return ()=>ac.abort();
 },[pagina,busqueda,activo,version]);
 const recargar=()=>setVersion(v=>v+1);
 const iniciarBusqueda=e=>{e.preventDefault();setPagina(1);setBusqueda(buscar.trim());};
 const nuevo=()=>{setForm({...vacio});setIdEditar(null);setError('');setExito('');};
 const editar=i=>{setForm({codigo:i.codigo,nombre:i.nombre,descripcion:i.descripcion??'',unidad_medida:i.unidad_medida??'unidad',stock_actual:i.stock_actual,stock_minimo:i.stock_minimo,activo:!!i.activo});setIdEditar(i.id);setError('');setExito('');};
 const guardar=async e=>{e.preventDefault();setError('');setExito('');
  if(form.codigo.trim().length<2||form.nombre.trim().length<3) return setError('Código mínimo 2 caracteres y nombre mínimo 3.');
  if(!form.unidad_medida.trim()) return setError('Indique la unidad de medida.');
  for(const campo of ['stock_actual','stock_minimo']) if(!Number.isInteger(Number(form[campo]))||Number(form[campo])<0) return setError('El stock debe ser un número entero no negativo.');
  const payload={...form,codigo:form.codigo.trim().toUpperCase(),nombre:form.nombre.trim(),unidad_medida:form.unidad_medida.trim(),stock_actual:Number(form.stock_actual),stock_minimo:Number(form.stock_minimo)};
  setGuardando(true);try{if(idEditar!==null)await materialService.editar(idEditar,payload);else await materialService.crear(payload);setForm(null);setExito(idEditar!==null?'Material actualizado.':'Material creado.');setPagina(1);recargar();}catch(e){setError(e.message);}finally{setGuardando(false);}
 };
 const eliminar=async()=>{setGuardando(true);setError('');try{await materialService.eliminar(borrar.id);setBorrar(null);setExito('Material eliminado.');setPagina(1);recargar();}catch(e){setError(e.message);setBorrar(null);}finally{setGuardando(false);}};
 const columnas=[{clave:'codigo',titulo:'Código'},{clave:'nombre',titulo:'Material'},{clave:'unidad_medida',titulo:'Unidad'},{clave:'stock_actual',titulo:'Stock',render:i=><span className={i.stock_actual<=i.stock_minimo?'text-danger fw-bold':''}>{i.stock_actual}</span>},{clave:'stock_minimo',titulo:'Mínimo'},{clave:'activo',titulo:'Estado',render:i=><span className={`badge ${i.activo?'bg-success':'bg-secondary'}`}>{i.activo?'Activo':'Inactivo'}</span>}];
 return <div className="container-fluid py-3"><div className="d-flex justify-content-between align-items-center mb-3"><h2>Materiales</h2>{esAdministrador&&<button className="btn btn-primary" onClick={nuevo}>Nuevo material</button>}</div>
  <AlertMessage mensaje={error} cerrar={()=>setError('')}/><AlertMessage mensaje={exito} tipo="success" cerrar={()=>setExito('')}/>
  <div className="row g-2 mb-3"><div className="col-md-7"><form onSubmit={iniciarBusqueda}><label className="form-label" htmlFor="material-busqueda">Buscar por nombre o código</label><div className="input-group"><input id="material-busqueda" className="form-control" value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="Ej. Cable, MAT001..."/><button className="btn btn-outline-primary">Buscar</button></div></form></div>
  <div className="col-md-5"><label className="form-label" htmlFor="material-activo">Estado</label><select id="material-activo" className="form-select" value={activo} onChange={e=>{setActivo(e.target.value);setPagina(1);}}><option value="">Todos</option><option value="true">Activos</option><option value="false">Inactivos</option></select></div></div>
  <DataTable columnas={columnas} datos={datos} cargando={cargando} renderAcciones={esAdministrador?(i)=><div className="btn-group btn-group-sm"><button className="btn btn-outline-primary" onClick={()=>editar(i)}>Editar</button><button className="btn btn-outline-danger" onClick={()=>setBorrar(i)}>Eliminar</button></div>:null}/>
  <Pagination pagina={pagina} anterior={anterior} siguiente={siguiente} total={total} cambiar={setPagina} deshabilitado={cargando}/>
  {form&&<div className="card mt-4"><div className="card-header fw-semibold">{idEditar===null?'Nuevo material':'Editar material'}</div><form className="card-body" onSubmit={guardar}><div className="row g-3">
   <div className="col-md-4"><label className="form-label" htmlFor="m-codigo">Código</label><input id="m-codigo" required minLength="2" maxLength="20" className="form-control" value={form.codigo} onChange={e=>setForm(f=>({...f,codigo:e.target.value}))}/></div>
   <div className="col-md-8"><label className="form-label" htmlFor="m-nombre">Nombre</label><input id="m-nombre" required minLength="3" maxLength="120" className="form-control" value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))}/></div>
   <div className="col-md-12"><label className="form-label" htmlFor="m-descripcion">Descripción</label><textarea id="m-descripcion" className="form-control" rows="2" value={form.descripcion} onChange={e=>setForm(f=>({...f,descripcion:e.target.value}))}/></div>
   <div className="col-md-4"><label className="form-label" htmlFor="m-unidad">Unidad de medida</label><input id="m-unidad" required maxLength="30" className="form-control" value={form.unidad_medida} onChange={e=>setForm(f=>({...f,unidad_medida:e.target.value}))}/></div>
   <div className="col-md-4"><label className="form-label" htmlFor="m-stock">Stock actual</label><input id="m-stock" type="number" min="0" step="1" required className="form-control" value={form.stock_actual} onChange={e=>setForm(f=>({...f,stock_actual:e.target.value}))}/></div>
   <div className="col-md-4"><label className="form-label" htmlFor="m-minimo">Stock mínimo</label><input id="m-minimo" type="number" min="0" step="1" required className="form-control" value={form.stock_minimo} onChange={e=>setForm(f=>({...f,stock_minimo:e.target.value}))}/></div>
   <div className="col-12"><div className="form-check"><input id="m-activo-form" className="form-check-input" type="checkbox" checked={form.activo} onChange={e=>setForm(f=>({...f,activo:e.target.checked}))}/><label htmlFor="m-activo-form" className="form-check-label">Material activo</label></div></div>
  </div><div className="mt-3 d-flex gap-2"><button className="btn btn-success" type="submit" disabled={guardando}>{guardando?'Guardando...':'Guardar'}</button><button className="btn btn-secondary" type="button" disabled={guardando} onClick={()=>setForm(null)}>Cancelar</button></div></form></div>}
  <ConfirmModal abierto={!!borrar} mensaje={borrar?`¿Eliminar el material ${borrar.nombre}? Si ya se utilizó en una orden, Django impedirá eliminarlo.`:''} confirmar={eliminar} cancelar={()=>setBorrar(null)} procesando={guardando}/>
 </div>;
}
