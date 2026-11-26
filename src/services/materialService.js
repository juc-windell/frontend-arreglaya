import api from '../api/axios';

export const materialService = {
  listar: (filtros = {}, signal) =>
    api.get('/materiales/', {
      params: filtros,
      signal
    }).then(r => r.data),

  detalle: (id) =>
    api.get(`/materiales/${id}/`).then(r => r.data),

  crear: (datos) =>
    api.post('/materiales/', datos).then(r => r.data),

  editar: (id, datos) =>
    api.patch(`/materiales/${id}/`, datos).then(r => r.data),

  eliminar: (id) =>
    api.delete(`/materiales/${id}/`).then(r => r.data)
};