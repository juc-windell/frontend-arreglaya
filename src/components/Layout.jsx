import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

// =============================================================================
// Estructura comun de las paginas privadas: barra superior, menu lateral y
// area principal. <Outlet /> pinta la pagina de la ruta activa sin recargar.
// =============================================================================
export default function Layout() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar onAbrirMenu={() => setMenuAbierto(true)} />
      <div className="d-flex flex-grow-1">
        <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
        <main className="flex-grow-1 p-3 p-md-4 bg-body-tertiary app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
