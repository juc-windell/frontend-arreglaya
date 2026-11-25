import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Pantalla 403: el usuario tiene sesion pero su perfil no permite esta seccion
export default function AccesoDenegado() {
  const { rol } = useAuth()
  return (
    <div className="text-center py-5">
      <i className="bi bi-shield-lock display-3 text-danger" />
      <h1 className="h3 mt-3">403 · Acceso denegado</h1>
      <p className="text-body-secondary">
        Su perfil <strong>{rol}</strong> no tiene permiso para esta sección.
      </p>
      <Link to="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </div>
  )
}
