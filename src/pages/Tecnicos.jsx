import { useCallback, useEffect, useState } from 'react';
import { tecnicoService } from '../services/tecnicoService';
import DataTable from '../components/DataTable';
import AlertMessage from '../components/AlertMessage';
import ConfirmModal from '../components/ConfirmModal';
import { interpretarError } from '../api/errores';

const ESPECIALIDADES = [
  ['ELECTRICIDAD', 'Electricidad'],
  ['PLOMERIA', 'Plomería'],
  ['AIRES', 'Aires acondicionados'],
  ['GENERAL', 'General'],
];

const vacio = {
  nombre: '',
  identificacion: '',
  especialidad: 'GENERAL',
  telefono: '',
  activo: true,
  max_ordenes_abiertas: 3,
};

const lista = (d) =>
  Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : [];

export default function Tecnicos({ esAdministrador = false }) {
  const [datos, setDatos] = useState([]);
  const [filtros, setFiltros] = useState({ especialidad: '', activo: '' });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [form, setForm] = useState(null);
  const [idEditar, setIdEditar] = useState(null);
  const [borrar, setBorrar] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const ac = new AbortController();
    setCargando(true);
    setError('');
    tecnicoService
      .listar(filtros, ac.signal)
      .then((d) => setDatos(lista(d)))
      .catch((e) => {
        if(e.code !== 'ERR_CANCELED' && e.name !== 'CanceledError') setError(interpretarError(e).mensaje);
      })
      .finally(() => {
        if (!ac.signal.aborted) setCargando(false);
      });
    return () => ac.abort();
  }, [filtros, version]);

  const cargar = () => setVersion((v) => v + 1);

  const cambiar = (clave, valor) =>
    setFiltros((f) => ({ ...f, [clave]: valor }));

  const editar = (item) => {
    setError('');
    setExito('');
    setForm({
      nombre: item.nombre,
      identificacion: item.identificacion,
      especialidad: item.especialidad,
      telefono: item.telefono,
      activo: !!item.activo,
      max_ordenes_abiertas: item.max_ordenes_abiertas,
    });
    setIdEditar(item.id);
  };

  const nuevo = () => {
    setForm({ ...vacio });
    setIdEditar(null);
    setError('');
    setExito('');
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    if (form.nombre.trim().length < 3)
      return setError('El nombre debe tener al menos 3 caracteres.');
    if (!form.identificacion.trim() || !form.telefono.trim())
      return setError('Identificación y teléfono son obligatorios.');
    if (
      !Number.isInteger(Number(form.max_ordenes_abiertas)) ||
      Number(form.max_ordenes_abiertas) < 0
    )
      return setError('La capacidad debe ser un entero no negativo.');
    const payload = {
      ...form,
      nombre: form.nombre.trim(),
      identificacion: form.identificacion.trim(),
      telefono: form.telefono.trim(),
      max_ordenes_abiertas: Number(form.max_ordenes_abiertas),
    };
    setGuardando(true);
    try {
      if (idEditar !== null) await tecnicoService.editar(idEditar, payload);
      else await tecnicoService.crear(payload);
      setForm(null);
      setExito(idEditar !== null ? 'Técnico actualizado.' : 'Técnico creado.');
      cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    setGuardando(true);
    setError('');
    try {
      await tecnicoService.eliminar(borrar.id);
      setBorrar(null);
      setExito('Técnico eliminado.');
      cargar();
    } catch (e) {
      setError(e.message);
      setBorrar(null);
    } finally {
      setGuardando(false);
    }
  };

  const columnas = [
    { clave: 'nombre', titulo: 'Nombre' },
    { clave: 'identificacion', titulo: 'Identificación' },
    {
      clave: 'especialidad',
      titulo: 'Especialidad',
      render: (i) =>
        ESPECIALIDADES.find((x) => x[0] === i.especialidad)?.[1] ??
        i.especialidad,
    },
    { clave: 'telefono', titulo: 'Teléfono' },
    { clave: 'max_ordenes_abiertas', titulo: 'Cupo máximo' },
    {
      clave: 'activo',
      titulo: 'Estado',
      render: (i) => (
        <span className={`badge ${i.activo ? 'bg-success' : 'bg-secondary'}`}>
          {i.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Técnicos</h2>
        {esAdministrador && (
          <button className="btn btn-primary" onClick={nuevo}>
            Nuevo técnico
          </button>
        )}
      </div>

      <AlertMessage mensaje={error} cerrar={() => setError('')} />
      <AlertMessage
        mensaje={exito}
        tipo="success"
        cerrar={() => setExito('')}
      />

      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <label htmlFor="tecnico-especialidad" className="form-label">
            Especialidad
          </label>
          <select
            id="tecnico-especialidad"
            className="form-select"
            value={filtros.especialidad}
            onChange={(e) => cambiar('especialidad', e.target.value)}
          >
            <option value="">Todas</option>
            {ESPECIALIDADES.map(([v, t]) => (
              <option key={v} value={v}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label htmlFor="tecnico-activo" className="form-label">
            Estado
          </label>
          <select
            id="tecnico-activo"
            className="form-select"
            value={filtros.activo}
            onChange={(e) => cambiar('activo', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      <DataTable
        columnas={columnas}
        datos={datos}
        cargando={cargando}
        renderAcciones={
          esAdministrador
            ? (item) => (
                <div className="btn-group btn-group-sm">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => editar(item)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => setBorrar(item)}
                  >
                    Eliminar
                  </button>
                </div>
              )
            : null
        }
      />

      {form && (
        <div className="card mt-4">
          <div className="card-header fw-semibold">
            {idEditar === null ? 'Nuevo técnico' : 'Editar técnico'}
          </div>
          <form onSubmit={guardar} className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="t-nombre">
                  Nombre
                </label>
                <input
                  id="t-nombre"
                  required
                  maxLength="100"
                  minLength="3"
                  className="form-control"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nombre: e.target.value }))
                  }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="t-identificacion">
                  Identificación
                </label>
                <input
                  id="t-identificacion"
                  required
                  maxLength="20"
                  className="form-control"
                  value={form.identificacion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, identificacion: e.target.value }))
                  }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="t-especialidad">
                  Especialidad
                </label>
                <select
                  id="t-especialidad"
                  className="form-select"
                  value={form.especialidad}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, especialidad: e.target.value }))
                  }
                >
                  {ESPECIALIDADES.map(([v, t]) => (
                    <option key={v} value={v}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="t-telefono">
                  Teléfono
                </label>
                <input
                  id="t-telefono"
                  required
                  maxLength="15"
                  className="form-control"
                  value={form.telefono}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, telefono: e.target.value }))
                  }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="t-max">
                  Máximo de órdenes abiertas
                </label>
                <input
                  id="t-max"
                  required
                  type="number"
                  min="0"
                  step="1"
                  className="form-control"
                  value={form.max_ordenes_abiertas}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      max_ordenes_abiertas: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-md-6 d-flex align-items-end">
                <div className="form-check mb-2">
                  <input
                    id="t-activo"
                    className="form-check-input"
                    type="checkbox"
                    checked={form.activo}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, activo: e.target.checked }))
                    }
                  />
                  <label htmlFor="t-activo" className="form-check-label">
                    Técnico activo
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-3 d-flex gap-2">
              <button
                className="btn btn-success"
                type="submit"
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                disabled={guardando}
                onClick={() => setForm(null)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        abierto={!!borrar}
        mensaje={
          borrar
            ? `¿Eliminar al técnico ${borrar.nombre}? Si tiene órdenes asociadas, Django rechazará la operación.`
            : ''
        }
        confirmar={eliminar}
        cancelar={() => setBorrar(null)}
        procesando={guardando}
      />
    </div>
  );
}