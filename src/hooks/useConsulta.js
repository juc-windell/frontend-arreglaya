import { useCallback, useEffect, useState } from 'react'
import { interpretarError } from '../api/errores'

// =============================================================================
// Hook para consultar la API con estados de carga y error.
//
//   const { datos, cargando, error, recargar } =
//     useConsulta(() => listarEspacios({ tipo }), [tipo])
//
// - Vuelve a consultar cuando cambian las dependencias o al llamar recargar().
// - "cargando" se deriva comparando la clave de la consulta actual con la
//   ultima respuesta recibida, asi no se llama setState dentro del efecto.
// - Si llega una respuesta vieja (el usuario cambio el filtro), se descarta.
// - "error" es el resultado de interpretarError: { status, mensaje, campos }.
// =============================================================================
export function useConsulta(consultar, dependencias = []) {
  const [version, setVersion] = useState(0)
  const clave = JSON.stringify([...dependencias, version])
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: null })

  useEffect(() => {
    let vigente = true
    consultar()
      .then((datos) => {
        if (vigente) setResultado({ clave, datos, error: null })
      })
      .catch((err) => {
        if (vigente) setResultado({ clave, datos: null, error: interpretarError(err) })
      })
    return () => {
      vigente = false
    }
    // La clave resume las dependencias; consultar se recrea en cada render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])

  return {
    datos: resultado.datos,
    error: resultado.error,
    cargando: resultado.clave !== clave,
    recargar,
  }
}
