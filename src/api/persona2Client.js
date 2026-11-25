// Adaptador aislado: no modifica el cliente HTTP de la Persona 1.
// Si Persona 1 usa AuthContext, conectar el getter desde App.jsx.
let tokenGetter = () => localStorage.getItem('arreglaya_token');
export function configurarTokenPersona2(fn) { tokenGetter = fn; }
const urlBase = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
export function apiUrlPersona2(ruta, parametros = {}) {
  const url = new URL(`${urlBase}${ruta.startsWith('/') ? ruta : '/'+ruta}`);
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== '' && valor !== null && valor !== undefined) url.searchParams.set(clave, String(valor));
  });
  return url.toString();
}
export class ErrorAPI extends Error { constructor(mensaje, status, detalles) { super(mensaje); this.name='ErrorAPI'; this.status=status; this.detalles=detalles; } }
export function textoError(data, status) {
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.detail) return String(data.detail);
  if (data?.non_field_errors) return data.non_field_errors.join(', ');
  if (data && typeof data === 'object') return Object.entries(data).map(([campo,v])=>`${campo}: ${Array.isArray(v)?v.join(', '):String(v)}`).join(' | ');
  const textos = {400:'Datos inválidos',401:'Sesión inválida o vencida',403:'No tiene permisos para esta acción',404:'Recurso no encontrado',409:'Conflicto con los registros existentes'};
  return textos[status] || `Error HTTP ${status}`;
}
export async function peticionPersona2(ruta, { method='GET', body, params={}, signal }={}) {
  const token = tokenGetter();
  const headers = {'Accept':'application/json'};
  if (body !== undefined) headers['Content-Type']='application/json';
  if (token) headers.Authorization=`Token ${token}`;
  let response;
  try { response = await fetch(apiUrlPersona2(ruta,params), {method,headers,body:body===undefined?undefined:JSON.stringify(body),signal}); }
  catch(err) { if (err.name === 'AbortError') throw err; throw new ErrorAPI('No se pudo conectar al servidor Django. Verifique la URL, CORS y la red.',0,null); }
  let data = null;
  if (response.status!==204) { const raw=await response.text(); if (raw) { try {data=JSON.parse(raw);} catch {data=raw;} } }
  if (!response.ok) throw new ErrorAPI(textoError(data,response.status),response.status,data);
  return data;
}
