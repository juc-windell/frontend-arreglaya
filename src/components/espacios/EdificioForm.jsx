import { useState } from 'react'

// =============================================================================
// Formulario controlado de Edificio (crear y editar).
// Las validaciones replican las del EdificioSerializer para dar retroalimentacion
// inmediata, pero Django vuelve a validar y sus errores se muestran por campo.
// =============================================================================
const VACIO = { nombre: '', codigo: '', activo: true }

function validar(valores) {
  const errores = {}
  const nombre = valores.nombre.trim()
  const codigo = valores.codigo.trim()

  if (!nombre) errores.nombre = 'El nombre es obligatorio.'
  else if (nombre.length < 3) errores.nombre = 'El nombre debe tener al menos 3 caracteres.'
  else if (nombre.length > 100) errores.nombre = 'Máximo 100 caracteres.'

  if (!codigo) errores.codigo = 'El código es obligatorio.'
  else if (codigo.length < 2) errores.codigo = 'El código debe tener al menos 2 caracteres.'
  else if (codigo.length > 10) errores.codigo = 'Máximo 10 caracteres.'

  return errores
}

export default function EdificioForm({ inicial, erroresServidor, enviando, textoBoton, onGuardar, onCancelar }) {
  const [valores, setValores] = useState(() => ({ ...VACIO, ...inicial }))
  const [erroresLocales, setErrores] = useState({})

  // Se combinan los errores 400 que devuelve Django con los de la validacion
  // local. Al editar un campo se guarda '' para ocultar su error anterior.
  const errores = { ...erroresServidor, ...erroresLocales }

  function manejarCambio(evento) {
    const { name, value, type, checked } = evento.target
    setValores((anterior) => ({ ...anterior, [name]: type === 'checkbox' ? checked : value }))
    setErrores((anterior) => ({ ...anterior, [name]: '' }))
  }

  function manejarEnvio(evento) {
    evento.preventDefault()
    const nuevos = validar(valores)
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    onGuardar({
      nombre: valores.nombre.trim(),
      codigo: valores.codigo.trim().toUpperCase(),
      activo: valores.activo,
    })
  }

  return (
    <form onSubmit={manejarEnvio} noValidate>
      <div className="row g-3">
        <div className="col-12 col-md-8">
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
            placeholder="Ej.: Edificio de Ciencias"
          />
          <div className="invalid-feedback">{errores.nombre}</div>
        </div>

        <div className="col-12 col-md-4">
          <label htmlFor="codigo" className="form-label">
            Código <span className="text-danger">*</span>
          </label>
          <input
            id="codigo"
            name="codigo"
            type="text"
            maxLength={10}
            required
            className={`form-control text-uppercase ${errores.codigo ? 'is-invalid' : ''}`}
            value={valores.codigo}
            onChange={manejarCambio}
            placeholder="Ej.: EC"
          />
          <div className="invalid-feedback">{errores.codigo}</div>
          <div className="form-text">Se guarda en mayúsculas.</div>
        </div>

        <div className="col-12">
          <div className="form-check form-switch">
            <input
              id="activo"
              name="activo"
              type="checkbox"
              role="switch"
              className="form-check-input"
              checked={valores.activo}
              onChange={manejarCambio}
            />
            <label htmlFor="activo" className="form-check-label">
              Edificio activo
            </label>
          </div>
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
