import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { interpretarError } from '../api/errores'
import AvisoPermiso from '../components/espacios/AvisoPermiso'
import EdificioForm from '../components/espacios/EdificioForm'
import EstadoListado from '../components/espacios/EstadoListado'
import { useAuth } from '../hooks/useAuth'
import { actualizarEdificio, crearEdificio, obtenerEdificio } from '../services/edificioService'

// =============================================================================
// Crear (/edificios/nuevo) o editar (/edificios/:id/editar) un edificio.
// Al editar, el formulario se precarga con GET /api/edificios/:id/
// =============================================================================
export default function EdificioEditar() {
  const { id } = useParams()
  const esEdicion = Boolean(id)
  const navigate = useNavigate()
  const { rol, puede } = useAuth()

  const [inicial, setInicial] = useState(null)
  const [cargando, setCargando] = useState(esEdicion)
  const [errorCarga, setErrorCarga] = useState('')
  const [erroresServidor, setErroresServidor] = useState(null)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!esEdicion) return
    obtenerEdificio(id)
      .then(setInicial)
      .catch((err) => setErrorCarga(interpretarError(err).mensaje))
      .finally(() => setCargando(false))
  }, [id, esEdicion])

  async function guardar(datos) {
    setEnviando(true)
    setErrorGeneral('')
    setErroresServidor(null)
    try {
      const guardado = esEdicion ? await actualizarEdificio(id, datos) : await crearEdificio(datos)
      navigate(`/edificios/${guardado.id}`, {
        state: { exito: esEdicion ? 'Edificio actualizado correctamente.' : 'Edificio creado correctamente.' },
      })
    } catch (err) {
      const info = interpretarError(err)
      const soloCampos = info.status === 400 && !info.detalle && Object.keys(info.campos).length > 0
      setErrorGeneral(soloCampos ? 'El servidor rechazó los datos (400). Revise los campos marcados.' : info.mensaje)
      setErroresServidor(info.campos)
    } finally {
      setEnviando(false)
    }
  }

  const accion = esEdicion ? 'editar' : 'crear'

  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/edificios">Edificios</Link>
          </li>
          <li className="breadcrumb-item active">{esEdicion ? 'Editar' : 'Nuevo'}</li>
        </ol>
      </nav>

      <div className="card border-0 shadow-sm" style={{ maxWidth: 760 }}>
        <div className="card-body p-4">
          <h1 className="h4 mb-4">{esEdicion ? 'Editar edificio' : 'Nuevo edificio'}</h1>

          {!puede('edificios', accion) && <AvisoPermiso rol={rol} recurso="Edificios" />}

          {errorGeneral && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-x-circle me-2" />
              {errorGeneral}
            </div>
          )}

          {cargando && <EstadoListado cargando />}
          {errorCarga && <EstadoListado error={errorCarga} />}

          {!cargando && !errorCarga && (
            <EdificioForm
              inicial={inicial}
              erroresServidor={erroresServidor}
              enviando={enviando}
              textoBoton={esEdicion ? 'Guardar cambios' : 'Crear edificio'}
              onGuardar={guardar}
              onCancelar={() => navigate(esEdicion ? `/edificios/${id}` : '/edificios')}
            />
          )}
        </div>
      </div>
    </>
  )
}
