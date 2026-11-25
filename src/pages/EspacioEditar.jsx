import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { interpretarError } from '../api/errores'
import AvisoPermiso from '../components/espacios/AvisoPermiso'
import EspacioForm from '../components/espacios/EspacioForm'
import EstadoListado from '../components/espacios/EstadoListado'
import { useAuth } from '../hooks/useAuth'
import { listarEdificios } from '../services/edificioService'
import { actualizarEspacio, crearEspacio, obtenerEspacio } from '../services/espacioService'

// =============================================================================
// Crear (/espacios/nuevo?edificio=<id>) o editar (/espacios/:id/editar).
// Carga los edificios reales para el selector y, al editar, precarga el espacio.
// =============================================================================
export default function EspacioEditar() {
  const { id } = useParams()
  const esEdicion = Boolean(id)
  const [parametros] = useSearchParams()
  const navigate = useNavigate()
  const { rol, puede } = useAuth()

  const [edificios, setEdificios] = useState([])
  const [inicial, setInicial] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [erroresServidor, setErroresServidor] = useState(null)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const pedidos = [listarEdificios(), esEdicion ? obtenerEspacio(id) : Promise.resolve(null)]
    Promise.all(pedidos)
      .then(([listaEdificios, espacio]) => {
        setEdificios(listaEdificios)
        // Al crear desde el detalle de un edificio, se preselecciona ese edificio
        setInicial(espacio ?? { edificio: parametros.get('edificio') || '' })
      })
      .catch((err) => setErrorCarga(interpretarError(err).mensaje))
      .finally(() => setCargando(false))
  }, [id, esEdicion, parametros])

  async function guardar(datos) {
    setEnviando(true)
    setErrorGeneral('')
    setErroresServidor(null)
    try {
      const guardado = esEdicion ? await actualizarEspacio(id, datos) : await crearEspacio(datos)
      navigate(`/espacios/${guardado.id}`, {
        state: { exito: esEdicion ? 'Espacio actualizado correctamente.' : 'Espacio creado correctamente.' },
      })
    } catch (err) {
      const info = interpretarError(err)
      const soloCampos = info.status === 400 && !info.detalle && Object.keys(info.campos).length > 0
      // non_field_errors (nombre repetido en el mismo edificio) llega como mensaje general
      setErrorGeneral(soloCampos ? 'El servidor rechazó los datos (400). Revise los campos marcados.' : info.mensaje)
      setErroresServidor(info.campos)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/espacios">Espacios</Link>
          </li>
          <li className="breadcrumb-item active">{esEdicion ? 'Editar' : 'Nuevo'}</li>
        </ol>
      </nav>

      <div className="card border-0 shadow-sm" style={{ maxWidth: 760 }}>
        <div className="card-body p-4">
          <h1 className="h4 mb-4">{esEdicion ? 'Editar espacio' : 'Nuevo espacio'}</h1>

          {!puede('espacios', esEdicion ? 'editar' : 'crear') && <AvisoPermiso rol={rol} recurso="Espacios" />}

          {errorGeneral && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-x-circle me-2" />
              {errorGeneral}
            </div>
          )}

          {cargando && <EstadoListado cargando />}
          {errorCarga && <EstadoListado error={errorCarga} />}

          {!cargando && !errorCarga && edificios.length === 0 && (
            <div className="alert alert-info">
              Primero debe existir al menos un edificio. <Link to="/edificios/nuevo">Crear edificio</Link>
            </div>
          )}

          {!cargando && !errorCarga && edificios.length > 0 && (
            <EspacioForm
              inicial={inicial}
              edificios={edificios}
              erroresServidor={erroresServidor}
              enviando={enviando}
              textoBoton={esEdicion ? 'Guardar cambios' : 'Crear espacio'}
              onGuardar={guardar}
              onCancelar={() => navigate(esEdicion ? `/espacios/${id}` : '/espacios')}
            />
          )}
        </div>
      </div>
    </>
  )
}
