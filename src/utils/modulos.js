// =============================================================================
// Los cinco modulos de negocio del Proyecto 1.
// Lo usan el menu lateral (Sidebar) y los accesos del Dashboard, asi el menu
// se define en un solo lugar.
// =============================================================================

export const MODULOS = [
  {
    clave: 'espacios',
    titulo: 'Espacios',
    descripcion: 'Edificios del campus y sus espacios',
    icono: 'bi-buildings',
    responsable: 'Persona 1',
    enlaces: [
      { ruta: '/edificios', texto: 'Edificios', icono: 'bi-building', recurso: 'edificios' },
      { ruta: '/espacios', texto: 'Espacios', icono: 'bi-door-open', recurso: 'espacios' },
    ],
  },
  {
    clave: 'tecnicos',
    titulo: 'Técnicos',
    descripcion: 'Personal, especialidades y cupos',
    icono: 'bi-person-gear',
    responsable: 'Persona 2',
    enlaces: [{ ruta: '/tecnicos', texto: 'Técnicos', icono: 'bi-person-gear', recurso: 'tecnicos' }],
  },
  {
    clave: 'materiales',
    titulo: 'Materiales',
    descripcion: 'Inventario, existencias y stock mínimo',
    icono: 'bi-box-seam',
    responsable: 'Persona 2',
    enlaces: [{ ruta: '/materiales', texto: 'Materiales', icono: 'bi-box-seam', recurso: 'materiales' }],
  },
  {
    clave: 'solicitudes',
    titulo: 'Solicitudes',
    descripcion: 'Reportes de fallas y su estado',
    icono: 'bi-clipboard-check',
    responsable: 'Persona 3',
    enlaces: [
      { ruta: '/solicitudes', texto: 'Solicitudes', icono: 'bi-clipboard-check', recurso: 'solicitudes' },
    ],
  },
  {
    clave: 'ordenes',
    titulo: 'Órdenes de trabajo',
    descripcion: 'Asignación, avance y cierre',
    icono: 'bi-tools',
    responsable: 'Persona 3',
    enlaces: [{ ruta: '/ordenes', texto: 'Órdenes', icono: 'bi-tools', recurso: 'ordenes' }],
  },
]
