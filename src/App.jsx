import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import ModuloPendiente from './pages/ModuloPendiente'
import NotFound from './pages/NotFound'

// =============================================================================
// VERSION FASE 1 (PR de base y autenticacion).
// En el PR siguiente se reemplaza por el App.jsx final con Dashboard,
// Edificios y Espacios.
// =============================================================================
function InicioTemporal() {
  return (
    <div className="py-4">
      <h1 className="h3">ArreglaYa</h1>
      <p className="text-body-secondary">Sesión iniciada. El dashboard se integra en la siguiente fase.</p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<InicioTemporal />} />
          <Route path="edificios" element={<ModuloPendiente clave="espacios" />} />
          <Route path="espacios" element={<ModuloPendiente clave="espacios" />} />
          <Route path="tecnicos" element={<ModuloPendiente clave="tecnicos" />} />
          <Route path="materiales" element={<ModuloPendiente clave="materiales" />} />
          <Route path="solicitudes" element={<ModuloPendiente clave="solicitudes" />} />
          <Route path="ordenes" element={<ModuloPendiente clave="ordenes" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}
