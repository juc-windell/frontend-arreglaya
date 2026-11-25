// =============================================================================
// Matriz de permisos del Proyecto 1, replicada en el frontend.
// IMPORTANTE: esto SOLO adapta la interfaz (mostrar u ocultar botones).
// La autorizacion real la hace Django (usuarios/permisos.py) y responde 403.
// =============================================================================

export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  OPERADOR: 'Operador',
  CONSULTA: 'Consulta',
  SIN_PERFIL: 'Sin perfil',
}

const TODO = ['ver', 'crear', 'editar', 'eliminar']
const SOLO_VER = ['ver']
const GESTIONA = ['ver', 'crear', 'editar']

// SoloAdministradorModifica -> edificios, espacios, tecnicos, materiales
// OperadorGestiona          -> solicitudes y ordenes (DELETE solo administrador)
const MATRIZ = {
  edificios: { Administrador: TODO, Operador: SOLO_VER, Consulta: SOLO_VER },
  espacios: { Administrador: TODO, Operador: SOLO_VER, Consulta: SOLO_VER },
  tecnicos: { Administrador: TODO, Operador: SOLO_VER, Consulta: SOLO_VER },
  materiales: { Administrador: TODO, Operador: SOLO_VER, Consulta: SOLO_VER },
  solicitudes: { Administrador: TODO, Operador: GESTIONA, Consulta: SOLO_VER },
  ordenes: { Administrador: TODO, Operador: GESTIONA, Consulta: SOLO_VER },
}

// Igual que es_administrador() del backend: superusuario o grupo Administrador
export function obtenerRol(perfil) {
  if (!perfil) return ROLES.SIN_PERFIL
  const grupos = perfil.grupos || []
  if (perfil.is_superuser || grupos.includes(ROLES.ADMINISTRADOR)) return ROLES.ADMINISTRADOR
  if (grupos.includes(ROLES.OPERADOR)) return ROLES.OPERADOR
  if (grupos.includes(ROLES.CONSULTA)) return ROLES.CONSULTA
  return ROLES.SIN_PERFIL
}

// puedeRealizar('Operador', 'edificios', 'crear') -> false
export function puedeRealizar(rol, recurso, accion) {
  return MATRIZ[recurso]?.[rol]?.includes(accion) ?? false
}

export const COLOR_ROL = {
  Administrador: 'danger',
  Operador: 'primary',
  Consulta: 'secondary',
  'Sin perfil': 'dark',
}
