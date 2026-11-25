import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import EdificioDetalle from './pages/EdificioDetalle'
import EdificioEditar from './pages/EdificioEditar'
import Edificios from './pages/Edificios'
import EspacioDetalle from './pages/EspacioDetalle'
import EspacioEditar from './pages/EspacioEditar'
import Espacios from './pages/Espacios'
import Login from './pages/Login'
import Materiales from './pages/Materiales'
import ModuloPendiente from './pages/ModuloPendiente'
import NotFound from './pages/NotFound'
import Tecnicos from './pages/Tecnicos'

// =============================================================================
// Rutas de la SPA. Todo lo que esta dentro de <ProtectedRoute> exige sesion;
// <Layout> agrega la barra superior y el menu, y cambia solo el contenido.
// =============================================================================
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />

          {/* Modulo Espacios (Persona 1) */}
          <Route path="edificios" element={<Edificios />} />
          <Route path="edificios/nuevo" element={<EdificioEditar key="nuevo" />} />
          <Route path="edificios/:id" element={<EdificioDetalle />} />
          <Route path="edificios/:id/editar" element={<EdificioEditar key="editar" />} />
          <Route path="espacios" element={<Espacios />} />
          <Route path="espacios/nuevo" element={<EspacioEditar key="nuevo" />} />
          <Route path="espacios/:id" element={<EspacioDetalle />} />
          <Route path="espacios/:id/editar" element={<EspacioEditar key="editar" />} />

          {/* Persona 2: Tecnicos y Materiales */}
          <Route path="tecnicos" element={<Tecnicos />} />
          <Route path="materiales" element={<Materiales />} />

          {/* Persona 3: reemplazar ModuloPendiente por su pagina */}
          <Route path="solicitudes" element={<ModuloPendiente clave="solicitudes" />} />
          <Route path="ordenes" element={<ModuloPendiente clave="ordenes" />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}
