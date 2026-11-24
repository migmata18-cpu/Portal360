import { CircleCheck } from 'lucide-react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router'
import { Vacio } from '@/componentes/Basicos'
import { Estructura } from '@/componentes/Estructura'
import { useDemo } from '@/contexto/demo'
import { ProveedorDemo } from '@/contexto/ProveedorDemo'
import { Acceso } from '@/paginas/Acceso'
import { Dashboard } from '@/paginas/Dashboard'
import { Empleados } from '@/paginas/Empleados'
import { Incidencias } from '@/paginas/Incidencias'
import { Induccion } from '@/paginas/Induccion'
import { Solicitudes } from '@/paginas/Solicitudes'

function SoloAdmin() {
  const { rol } = useDemo()
  if (rol === 'admin') return <Empleados />
  return (
    <div className="tarjeta centrado">
      <Vacio titulo="Acceso restringido" texto="Esta sección es solo para administradores de Recursos Humanos." />
      <Link className="boton" to="/dashboard">Volver al dashboard</Link>
    </div>
  )
}

function NoEncontrada() {
  return (
    <div className="tarjeta centrado">
      <Vacio titulo="Página no encontrada" texto="La dirección no existe en Portal360." />
      <Link className="boton" to="/dashboard">Volver al dashboard</Link>
    </div>
  )
}

function Entrada() {
  const { rol } = useDemo()
  return rol ? <Navigate to="/dashboard" replace /> : <Acceso />
}

function Aviso() {
  const { aviso } = useDemo()
  return (
    <div className="zona-aviso" role="status">
      {aviso && <div className="aviso" key={aviso.id}><CircleCheck size={20} aria-hidden />{aviso.texto}</div>}
    </div>
  )
}

export function App() {
  return (
    <ProveedorDemo>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Entrada />} />
          <Route element={<Estructura />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/empleados" element={<SoloAdmin />} />
            <Route path="/solicitudes" element={<Solicitudes />} />
            <Route path="/induccion" element={<Induccion />} />
            <Route path="/incidencias" element={<Incidencias />} />
            <Route path="*" element={<NoEncontrada />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Aviso />
    </ProveedorDemo>
  )
}
