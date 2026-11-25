import { Link } from 'react-router-dom'

// Pantalla 404 para rutas del frontend que no existen
export default function NotFound() {
  return (
    <div className="text-center py-5">
      <i className="bi bi-signpost-split display-3 text-secondary" />
      <h1 className="h3 mt-3">404 · Página no encontrada</h1>
      <p className="text-body-secondary">La dirección que intentó abrir no existe.</p>
      <Link to="/" className="btn btn-primary">
        Ir al dashboard
      </Link>
    </div>
  )
}
