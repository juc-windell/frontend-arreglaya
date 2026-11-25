import { createContext } from 'react'

// Objeto de contexto de la sesion. Lo llena <AuthProvider> (AuthContext.jsx)
// y se lee con el hook useAuth() (hooks/useAuth.js).
export const AuthContext = createContext(null)
