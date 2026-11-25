import {peticionPersona2} from '../api/persona2Client';
const RUTA='/materiales/';
export const materialService={
  listar:(filtros={},signal)=>peticionPersona2(RUTA,{params:filtros,signal}),
  detalle:(id)=>peticionPersona2(`${RUTA}${id}/`),
  crear:(datos)=>peticionPersona2(RUTA,{method:'POST',body:datos}),
  editar:(id,datos)=>peticionPersona2(`${RUTA}${id}/`,{method:'PATCH',body:datos}),
  eliminar:(id)=>peticionPersona2(`${RUTA}${id}/`,{method:'DELETE'}),
};
