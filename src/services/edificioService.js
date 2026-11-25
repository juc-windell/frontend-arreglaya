import api from '../api/axios'

// =============================================================================
// CRUD de edificios -> /api/edificios/
// Lectura: cualquier usuario autenticado. Escritura: solo Administrador.
// =============================================================================

export async function listarEdificios() {
  const { data } = await api.get('/edificios/')
  return data
}

export async function obtenerEdificio(id) {
  const { data } = await api.get(`/edificios/${id}/`)
  return data
}

export async function crearEdificio(edificio) {
  const { data } = await api.post('/edificios/', edificio)
  return data
}

// PUT: actualizacion completa con todos los campos del formulario
export async function actualizarEdificio(id, edificio) {
  const { data } = await api.put(`/edificios/${id}/`, edificio)
  return data
}

// 204 si se elimina; 409 si el edificio tiene espacios (on_delete=PROTECT)
export async function eliminarEdificio(id) {
  await api.delete(`/edificios/${id}/`)
}
