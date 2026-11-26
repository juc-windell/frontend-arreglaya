import api from '../api/axios'
export const solicitudService = {
  listar: (params = {}, signal) => api.get('/solicitudes/', { params, signal }).then(r => r.data),
  detalle: id => api.get(`/solicitudes/${id}/`).then(r => r.data),
  crear: datos => api.post('/solicitudes/', datos).then(r => r.data),
  editar: (id, datos) => api.patch(`/solicitudes/${id}/`, datos).then(r => r.data),
  eliminar: id => api.delete(`/solicitudes/${id}/`).then(r => r.data),
}
