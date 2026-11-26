import api from '../api/axios'
export const ordenService = {
  listar: (params = {}, signal) => api.get('/ordenes/', { params, signal }).then(r => r.data),
  detalle: id => api.get(`/ordenes/${id}/`).then(r => r.data),
  crear: datos => api.post('/ordenes/', datos).then(r => r.data),
  editar: (id, datos) => api.patch(`/ordenes/${id}/`, datos).then(r => r.data),
  listarMateriales: id => api.get(`/ordenes/${id}/materiales/`).then(r => r.data),
  registrarMaterial: (id, datos) => api.post(`/ordenes/${id}/materiales/`, datos).then(r => r.data),
}
