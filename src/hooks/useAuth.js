import { useContext } from 'react'
import { AuthContext } from '../context/sesion'

// Hook para leer la sesion desde cualquier componente:
//   const { usuario, rol, puede, cerrarSesion } = useAuth()
export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return contexto
}
