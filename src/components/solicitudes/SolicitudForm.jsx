import { useState } from 'react'
export const CATEGORIAS = ['ELECTRICIDAD', 'PLOMERIA', 'AIRES', 'GENERAL']
export const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE']
export default function SolicitudForm({ inicial = {}, espacios = [], guardar, cancelar, procesando = false, campos = {} }) {
  const [form, setForm] = useState({
    espacio: inicial.espacio ?? '', descripcion: inicial.descripcion ?? '',
    categoria: inicial.categoria ?? 'GENERAL', prioridad: inicial.prioridad ?? 'MEDIA',
  })
  function actualizar(e) { setForm(v => ({ ...v, [e.target.name]: e.target.value })) }
  function enviar(e) {
    e.preventDefault()
    if (form.descripcion.trim().length < 5 || !form.espacio) return
    guardar({ ...form, espacio: Number(form.espacio), descripcion: form.descripcion.trim() })
  }
  return <form onSubmit={enviar} className="card card-body mt-3">
    <h3 className="h5">{inicial.id ? 'Editar solicitud' : 'Nueva solicitud'}</h3>
    <div className="mb-3"><label className="form-label" htmlFor="sol-espacio">Espacio</label>
      <select id="sol-espacio" name="espacio" className="form-select" value={form.espacio} onChange={actualizar} required>
        <option value="">Seleccionar espacio</option>
        {espacios.map(x => <option value={x.id} key={x.id}>{x.nombre}{x.edificio_nombre ? ` (${x.edificio_nombre})` : ''}</option>)}
      </select>{campos.espacio && <small className="text-danger">{campos.espacio}</small>}</div>
    <div className="mb-3"><label className="form-label" htmlFor="sol-descripcion">Descripción</label>
      <textarea id="sol-descripcion" name="descripcion" className="form-control" value={form.descripcion} onChange={actualizar} minLength={5} required rows={3}/>
      {campos.descripcion && <small className="text-danger">{campos.descripcion}</small>}</div>
    <div className="row g-3 mb-3"><div className="col-md-6"><label className="form-label" htmlFor="sol-categoria">Categoría</label>
      <select id="sol-categoria" name="categoria" className="form-select" value={form.categoria} onChange={actualizar}>{CATEGORIAS.map(x => <option key={x} value={x}>{x}</option>)}</select>
      {campos.categoria && <small className="text-danger">{campos.categoria}</small>}</div>
      <div className="col-md-6"><label className="form-label" htmlFor="sol-prioridad">Prioridad</label>
      <select id="sol-prioridad" name="prioridad" className="form-select" value={form.prioridad} onChange={actualizar}>{PRIORIDADES.map(x => <option key={x} value={x}>{x}</option>)}</select>
      {campos.prioridad && <small className="text-danger">{campos.prioridad}</small>}</div></div>
    <div className="d-flex gap-2"><button className="btn btn-primary" disabled={procesando}>{procesando ? 'Guardando…' : 'Guardar'}</button>
    <button type="button" className="btn btn-outline-secondary" onClick={cancelar} disabled={procesando}>Cancelar</button></div>
  </form>
}
