import api from '../api/axios'

// =============================================================================
// Endpoints de autenticacion del backend Django
// =============================================================================

// POST /api/token/  ->  { token }
export async function solicitarToken(username, password) {
  const { data } = await api.post('/token/', { username, password })
  return data.token
}

// GET /api/perfil/  ->  { id, username, email, grupos, is_superuser }
// Se envia el token explicitamente porque se llama justo despues del login
export async function obtenerPerfil(token) {
  const config = token ? { headers: { Authorization: `Token ${token}` } } : {}
  const { data } = await api.get('/perfil/', config)
  return data
}

// POST /api/logout/  ->  204 (borra el token en el servidor)
export async function revocarToken() {
  await api.post('/logout/')
}
