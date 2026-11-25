import { useState } from 'react'
import { TIPOS_ESPACIO } from '../../services/espacioService'

// =============================================================================
// Formulario controlado de Espacio (crear y editar).
// El selector de edificio se llena con datos reales de GET /api/edificios/.
// =============================================================================
const VACIO = { edificio: '', nombre: '', tipo: '', piso: '' }

function validar(valores) {
  const errores = {}
  const nombre = valores.nombre.trim()

  if (!valores.edificio) errores.edificio = 'Seleccione un edificio.'

  if (!nombre) errores.nombre = 'El nombre es obligatorio.'
  else if (nombre.length < 3) errores.nombre = 'El nombre debe tener al menos 3 caracteres.'
  else if (nombre.length > 100) errores.nombre = 'Máximo 100 caracteres.'

  if (!valores.tipo) errores.tipo = 'Seleccione el tipo de espacio.'

  if (valores.piso === '' || valores.piso === null) errores.piso = 'El piso es obligatorio.'
  else if (!Number.isInteger(Number(valores.piso))) errores.piso = 'El piso debe ser un número entero.'
  else if (Number(valores.piso) < 0) errores.piso = 'El piso no puede ser negativo.'

  return errores
}

export default function EspacioForm({ inicial, edificios, erroresServidor, enviando, textoBoton, onGuardar, onCancelar }) {
  const [valores, setValores] = useState(() => ({
    ...VACIO,
    ...inicial,
    edificio: inicial?.edificio ? String(inicial.edificio) : '',
    piso: inicial?.piso ?? '',
  }))
  const [erroresLocales, setErrores] = useState({})

  // Se combinan los errores 400 que devuelve Django con los de la validacion
  // local. Al editar un campo se guarda '' para ocultar su error anterior.
  const errores = { ...erroresServidor, ...erroresLocales }

  function manejarCambio(evento) {
    const { name, value } = evento.target
    setValores((anterior) => ({ ...anterior, [name]: value }))
    setErrores((anterior) => ({ ...anterior, [name]: '' }))
  }

  function manejarEnvio(evento) {
    evento.preventDefault()
    const nuevos = validar(valores)
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    onGuardar({
      edificio: Number(valores.edificio),
      nombre: valores.nombre.trim(),
      tipo: valores.tipo,
      piso: Number(valores.piso),
    })
  }

  return (
    <form onSubmit={manejarEnvio} noValidate>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label htmlFor="edificio" className="form-label">
            Edificio <span className="text-danger">*</span>
          </label>
          <select
            id="edificio"
            name="edificio"
            required
            className={`form-select ${errores.edificio ? 'is-invalid' : ''}`}
            value={valores.edificio}
            onChange={manejarCambio}
          >
            <option value="">Seleccione…</option>
            {edificios.map((edificio) => (
              <option key={edificio.id} value={edificio.id}>
                {edificio.codigo} · {edificio.nombre}
                {!edificio.activo ? ' (inactivo)' : ''}
              </option>
            ))}
          </select>
          <div className="invalid-feedback">{errores.edificio}</div>
        </div>

        <div className="col-12 col-md-6">
          <label htmlFor="nombre" className="form-label">
            Nombre <span className="text-danger">*</span>
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            maxLength={100}
            required
            className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
            value={valores.nombre}
            onChange={manejarCambio}
            placeholder="Ej.: Aula 101"
          />
          <div className="invalid-feedback">{errores.nombre}</div>
          <div className="form-text">No se puede repetir dentro del mismo edificio.</div>
        </div>

        <div className="col-12 col-md-6">
          <label htmlFor="tipo" className="form-label">
            Tipo <span className="text-danger">*</span>
          </label>
          <select
            id="tipo"
            name="tipo"
            required
            className={`form-select ${errores.tipo ? 'is-invalid' : ''}`}
            value={valores.tipo}
            onChange={manejarCambio}
          >
            <option value="">Seleccione…</option>
            {TIPOS_ESPACIO.map((tipo) => (
              <option key={tipo.valor} value={tipo.valor}>
                {tipo.texto}
              </option>
            ))}
          </select>
          <div className="invalid-feedback">{errores.tipo}</div>
        </div>

        <div className="col-12 col-md-6">
          <label htmlFor="piso" className="form-label">
            Piso <span className="text-danger">*</span>
          </label>
          <input
            id="piso"
            name="piso"
            type="number"
            min={0}
            step={1}
            required
            className={`form-control ${errores.piso ? 'is-invalid' : ''}`}
            value={valores.piso}
            onChange={manejarCambio}
          />
          <div className="invalid-feedback">{errores.piso}</div>
          <div className="form-text">0 = planta baja.</div>
        </div>
      </div>

      <div className="d-flex gap-2 justify-content-end mt-4">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando && <span className="spinner-border spinner-border-sm me-2" />}
          {textoBoton}
        </button>
      </div>
    </form>
  )
}
