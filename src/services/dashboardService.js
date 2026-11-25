import api from '../api/axios'

// =============================================================================
// Indicadores del dashboard. Todos salen de respuestas reales de la API.
// Se usa Promise.allSettled para que si un endpoint falla, los demas
// indicadores se sigan mostrando.
// =============================================================================

// Para listados paginados basta pedir la primera pagina y leer "count"
async function contarPaginado(ruta, params) {
  const { data } = await api.get(ruta, { params })
  return data.count
}

async function contarLista(ruta, params) {
  const { data } = await api.get(ruta, { params })
  return data.length
}

const CONSULTAS = {
  edificios: () => contarLista('/edificios/'),
  espacios: () => contarLista('/espacios/'),
  tecnicosActivos: () => contarLista('/tecnicos/', { activo: 'true' }),
  solicitudesAbiertas: () => contarPaginado('/solicitudes/', { estado: 'ABIERTA' }),
  ordenesEnProceso: () => contarPaginado('/ordenes/', { estado: 'EN_PROCESO' }),
  // GET /api/ordenes/consultas/ -> { bajo_stock, ordenes_por_estado, ... }
  consultas: async () => (await api.get('/ordenes/consultas/')).data,
  // GET /api/reportes/solicitudes-por-edificio/
  solicitudesPorEdificio: async () =>
    (await api.get('/reportes/solicitudes-por-edificio/')).data,
}

// Devuelve { clave: { ok: true, valor } | { ok: false, error } }
export async function cargarIndicadores() {
  const claves = Object.keys(CONSULTAS)
  const resultados = await Promise.allSettled(claves.map((clave) => CONSULTAS[clave]()))

  const indicadores = {}
  claves.forEach((clave, i) => {
    const r = resultados[i]
    indicadores[clave] =
      r.status === 'fulfilled' ? { ok: true, valor: r.value } : { ok: false, error: r.reason }
  })
  return indicadores
}
