// =============================================================================
// Aviso en formularios cuando el perfil no tiene permiso de escritura.
// No bloquea el envio a proposito: la seguridad la aplica Django, y asi se
// puede demostrar que el servidor responde 403 aunque se llegue al formulario
// escribiendo la URL directamente.
// =============================================================================
export default function AvisoPermiso({ rol, recurso }) {
  return (
    <div className="alert alert-warning d-flex gap-2" role="alert">
      <i className="bi bi-lock mt-1" />
      <div>
        Su perfil <strong>{rol}</strong> solo tiene permiso de lectura en <strong>{recurso}</strong>. Si
        intenta guardar, el servidor rechazará la operación con <strong>403</strong>.
      </div>
    </div>
  )
}
