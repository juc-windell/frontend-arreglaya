import { API_URL } from './axios'

// =============================================================================
// Convierte un error de Axios en un mensaje comprensible para el usuario.
// Devuelve { status, mensaje, campos, detalle } donde "campos" son los errores por campo
// que envia Django REST Framework en las respuestas 400:
//   { "nombre": ["El nombre debe tener al menos 3 caracteres"] }
// =============================================================================

// Toma el primer texto de un valor que puede ser string, arreglo u objeto
function primerTexto(valor) {
  if (!valor) return ''
  if (typeof valor === 'string') return valor
  if (Array.isArray(valor)) return primerTexto(valor[0])
  if (typeof valor === 'object') return primerTexto(Object.values(valor)[0])
  return String(valor)
}

export function interpretarError(error) {
  // Sin respuesta: servidor apagado, CORS bloqueado o sin red
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return {
        status: 0,
        mensaje: 'El servidor tardó demasiado en responder. Intente de nuevo.',
        campos: {},
      }
    }
    // El detalle tecnico (URL de la API) solo se muestra en la consola del navegador
    console.error(`[ArreglaYa] Sin respuesta de ${API_URL}: revise que Django este en ejecucion y CORS.`)
    return {
      status: 0,
      mensaje: 'No se pudo conectar con el servidor. Verifique su conexión e intente de nuevo.',
      campos: {},
    }
  }

  const { status, data } = error.response
  const campos = {}
  let detalle = ''

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const [clave, valor] of Object.entries(data)) {
      if (['detail', 'error', 'non_field_errors'].includes(clave)) {
        detalle = primerTexto(valor)
      } else {
        campos[clave] = primerTexto(valor)
      }
    }
  } else if (typeof data === 'string' && data.length < 300) {
    detalle = data
  }

  // Resumen "campo: mensaje" para mostrar el 400 donde no hay formulario
  const resumenCampos = Object.entries(campos)
    .map(([campo, texto]) => `${campo}: ${texto}`)
    .join(' · ')

  const mensajes = {
    400: detalle || `Datos inválidos (400). ${resumenCampos}`.trim(),
    401: 'Su sesión no es válida o expiró (401). Inicie sesión de nuevo.',
    403: `No tiene permisos para realizar esta operación (403). ${detalle}`.trim(),
    404: detalle || 'El recurso solicitado no existe (404).',
    409: detalle || 'La operación entra en conflicto con el estado actual (409).',
  }

  let mensaje = mensajes[status]
  if (!mensaje) {
    mensaje =
      status >= 500
        ? `Error interno del servidor (${status}). Intente más tarde.`
        : detalle || `Error inesperado (${status}).`
  }

  return { status, mensaje, campos, detalle }
}
