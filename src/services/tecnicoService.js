import api from '../api/axios';

export const tecnicoService = {
  listar: (filtros = {}, signal) =>
    api.get('/tecnicos/', {
      params: filtros,
      signal
    }).then(r => r.data),

  detalle: (id) =>
    api.get(`/tecnicos/${id}/`).then(r => r.data),

  crear: (datos) =>
    api.post('/tecnicos/', datos).then(r => r.data),

  editar: (id, datos) =>
    api.patch(`/tecnicos/${id}/`, datos).then(r => r.data),

  eliminar: (id) =>
    api.delete(`/tecnicos/${id}/`).then(r => r.data)
};