import { MODULOS } from '../utils/modulos'

// =============================================================================
// Marcador TEMPORAL de integracion para los modulos de las Personas 2 y 3.
// Solo existe para que la navegacion funcione mientras cada persona sube su
// pagina. Cuando la pagina real exista, se cambia la ruta en App.jsx y este
// archivo se elimina. No es una implementacion final ni usa datos simulados.
// =============================================================================
export default function ModuloPendiente({ clave }) {
  const modulo = MODULOS.find((m) => m.clave === clave)
  return (
    <div className="text-center py-5">
      <i className={`bi ${modulo?.icono} display-4 text-secondary`} />
      <h1 className="h4 mt-3">{modulo?.titulo}</h1>
      <p className="text-body-secondary mb-0">
        Pantalla en integración · a cargo de <strong>{modulo?.responsable}</strong>.
      </p>
    </div>
  )
}
