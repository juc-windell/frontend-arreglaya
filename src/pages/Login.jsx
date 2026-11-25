import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { interpretarError } from '../api/errores'
import { useAuth } from '../hooks/useAuth'

// =============================================================================
// Pantalla de login: obtiene un token real de Django (POST /api/token/)
// =============================================================================
export default function Login() {
  const { autenticado, iniciarSesion, aviso: avisoSesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ username: '', password: '' })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [verClave, setVerClave] = useState(false)

  // Mensaje que llega desde otra pantalla (logout, sesion expirada, ruta privada)
  const aviso = avisoSesion?.mensaje || location.state?.mensaje
  const tipoAviso = avisoSesion?.tipo || location.state?.tipo || 'info'
  const destino = location.state?.desde || '/'

  if (autenticado) {
    return <Navigate to={destino} replace />
  }

  function manejarCambio(evento) {
    const { name, value } = evento.target
    setForm((anterior) => ({ ...anterior, [name]: value }))
    setErrores((anterior) => ({ ...anterior, [name]: '' }))
  }

  // Validacion previa (complementa la del servidor, no la sustituye)
  function validar() {
    const nuevos = {}
    if (!form.username.trim()) nuevos.username = 'Ingrese su usuario.'
    if (!form.password) nuevos.password = 'Ingrese su contraseña.'
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setErrorGeneral('')
    if (!validar()) return

    setEnviando(true)
    try {
      await iniciarSesion(form.username.trim(), form.password)
      navigate(destino, { replace: true })
    } catch (error) {
      const info = interpretarError(error)
      // DRF responde 400 cuando el usuario o la clave no coinciden
      setErrorGeneral(
        info.status === 400 ? 'Usuario o contraseña incorrectos.' : info.mensaje,
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body-tertiary p-3">
      <div className="card shadow-sm border-0 w-100" style={{ maxWidth: 420 }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <i className="bi bi-wrench-adjustable-circle-fill text-warning display-5" />
            <h1 className="h3 fw-bold mt-2 mb-1">ArreglaYa</h1>
            <p className="text-body-secondary mb-0">Mantenimiento del campus</p>
          </div>

          {aviso && !errorGeneral && (
            <div className={`alert alert-${tipoAviso} py-2`} role="status">
              {aviso}
            </div>
          )}
          {errorGeneral && (
            <div className="alert alert-danger py-2" role="alert">
              <i className="bi bi-exclamation-triangle me-2" />
              {errorGeneral}
            </div>
          )}

          <form onSubmit={manejarEnvio} noValidate>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Usuario <span className="text-danger">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                className={`form-control ${errores.username ? 'is-invalid' : ''}`}
                value={form.username}
                onChange={manejarCambio}
              />
              <div className="invalid-feedback">{errores.username}</div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                Contraseña <span className="text-danger">*</span>
              </label>
              <div className="input-group has-validation">
                <input
                  id="password"
                  name="password"
                  type={verClave ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                  value={form.password}
                  onChange={manejarCambio}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setVerClave((v) => !v)}
                  aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <i className={`bi ${verClave ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
                <div className="invalid-feedback">{errores.password}</div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={enviando}>
              {enviando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Ingresando…
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <p className="small text-body-secondary text-center mt-4 mb-0">
            Usuarios de prueba: <code>admin1</code>, <code>operador1</code>, <code>consulta1</code>
          </p>
        </div>
      </div>
    </div>
  )
}
