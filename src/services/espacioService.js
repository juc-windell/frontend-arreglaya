import api from '../api/axios'

// =============================================================================
// CRUD de espacios -> /api/espacios/
// Filtros del servidor (extension Proyecto 2): ?edificio=<id> y ?tipo=<TIPO>
// =============================================================================

export const TIPOS_ESPACIO = [
  { valor: 'AULA', texto: 'Aula' },
  { valor: 'LABORATORIO', texto: 'Laboratorio' },
  { valor: 'OFICINA', texto: 'Oficina' },
  { valor: 'BAÑO', texto: 'Baño' },
  { valor: 'EXTERIOR', texto: 'Exterior' },
]

export function textoTipo(valor) {
  return TIPOS_ESPACIO.find((tipo) => tipo.valor === valor)?.texto ?? valor
}

// filtros = { edificio: '1', tipo: 'AULA' }; los vacios no se envian
export async function listarEspacios(filtros = {}) {
  const params = {}
  if (filtros.edificio) params.edificio = filtros.edificio
  if (filtros.tipo) params.tipo = filtros.tipo
  const { data } = await api.get('/espacios/', { params })
  return data
}

export async function obtenerEspacio(id) {
  const { data } = await api.get(`/espacios/${id}/`)
  return data
}

export async function crearEspacio(espacio) {
  const { data } = await api.post('/espacios/', espacio)
  return data
}

export async function actualizarEspacio(id, espacio) {
  const { data } = await api.put(`/espacios/${id}/`, espacio)
  return data
}

// 204 si se elimina; 409 si el espacio tiene solicitudes (on_delete=PROTECT)
export async function eliminarEspacio(id) {
  await api.delete(`/espacios/${id}/`)
}

// Relacion con el modulo de solicitudes: GET /api/solicitudes/?espacio=<id>
// (respuesta paginada: count, next, previous, results)
export async function listarSolicitudesDeEspacio(id, page = 1) {
  const { data } = await api.get('/solicitudes/', { params: { espacio: id, page } })
  return data
}
