import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// =============================================================================
// Lee un mensaje de exito enviado al navegar, por ejemplo:
//   navigate('/edificios', { state: { exito: 'Edificio creado' } })
// y limpia el state para que el mensaje no reaparezca al recargar.
// =============================================================================
export function useMensajeRuta() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mensaje, setMensaje] = useState(() => location.state?.exito || '')

  useEffect(() => {
    if (location.state?.exito) {
      navigate(location.pathname + location.search, { replace: true, state: null })
    }
  }, [location, navigate])

  return [mensaje, setMensaje]
}
