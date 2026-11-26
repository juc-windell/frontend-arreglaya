import { useMemo, useState } from 'react'
export default function OrdenForm({ solicitudes = [], tecnicos = [], ordenes = [], guardar, cancelar, procesando = false, campos = {} }) {
  const [form, setForm] = useState({ solicitud: '', tecnico: '', observaciones: '' })
  const ocupadas = useMemo(() => new Set(ordenes.map(o => Number(o.solicitud))), [ordenes])
  const disponibles = solicitudes.filter(s => s.estado === 'ABIERTA' && !ocupadas.has(Number(s.id)))
  const solicitud = disponibles.find(s => String(s.id) === String(form.solicitud))
  const tecnicosCompatibles = tecnicos.filter(t => t.activo && (!solicitud || t.especialidad === solicitud.categoria || t.especialidad === 'GENERAL'))
  function enviar(e) {
    e.preventDefault()
    if (!form.solicitud || !form.tecnico) return
    guardar({ solicitud: Number(form.solicitud), tecnico: Number(form.tecnico), observaciones: form.observaciones.trim() })
  }
  return <form onSubmit={enviar} className="card card-body mt-3">
    <h3 className="h5">Asignar orden de trabajo</h3>
    <p className="text-muted small">Django valida la especialidad y la disponibilidad real del técnico.</p>
    <div className="mb-3"><label className="form-label" htmlFor="ord-solicitud">Solicitud abierta</label>
      <select required className="form-select" id="ord-solicitud" value={form.solicitud} onChange={e => setForm(v => ({ ...v, solicitud: e.target.value, tecnico: '' }))}>
        <option value="">Seleccione una solicitud</option>
        {disponibles.map(s => <option key={s.id} value={s.id}>#{s.id} – {s.descripcion?.slice(0, 65)} ({s.categoria})</option>)}
      </select>{campos.solicitud && <small className="text-danger">{campos.solicitud}</small>}</div>
    <div className="mb-3"><label className="form-label" htmlFor="ord-tecnico">Técnico compatible</label>
      <select required className="form-select" id="ord-tecnico" disabled={!solicitud} value={form.tecnico} onChange={e => setForm(v => ({ ...v, tecnico: e.target.value }))}>
        <option value="">Seleccione un técnico</option>
        {tecnicosCompatibles.map(t => <option key={t.id} value={t.id}>{t.nombre} ({t.especialidad})</option>)}
      </select>{campos.tecnico && <small className="text-danger">{campos.tecnico}</small>}</div>
    <div className="mb-3"><label className="form-label" htmlFor="ord-observaciones">Observaciones</label>
      <textarea id="ord-observaciones" className="form-control" rows={2} value={form.observaciones} onChange={e => setForm(v => ({ ...v, observaciones: e.target.value }))}/>
      {campos.observaciones && <small className="text-danger">{campos.observaciones}</small>}</div>
    <div className="d-flex gap-2"><button className="btn btn-primary" disabled={procesando}>Crear orden</button><button type="button" className="btn btn-outline-secondary" onClick={cancelar}>Cancelar</button></div>
  </form>
}
