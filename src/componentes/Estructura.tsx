import { CalendarDays, ClipboardCheck, FileClock, FlaskConical, LayoutDashboard, LogOut, Menu, Orbit, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useDemo } from '@/contexto/demo'
import type { Rol } from '@/tipos'
import { Persona } from './Basicos'

const ENLACES = [
  { ruta: '/dashboard', texto: 'Dashboard', icono: LayoutDashboard },
  { ruta: '/empleados', texto: 'Empleados', icono: Users, soloAdmin: true },
  { ruta: '/solicitudes', texto: 'Permisos y vacaciones', icono: CalendarDays },
  { ruta: '/induccion', texto: 'Inducción', icono: ClipboardCheck },
  { ruta: '/incidencias', texto: 'Incidencias', icono: FileClock },
]

const ROLES: [Rol, string][] = [['trabajador', 'Trabajador'], ['admin', 'Administrador RR. HH.']]

export function Estructura() {
  const { rol, usuario, cambiarRol } = useDemo()
  const [abierto, setAbierto] = useState(false)
  const { pathname } = useLocation()
  const navegar = useNavigate()
  const actual = ENLACES.find((e) => e.ruta === pathname)?.texto ?? 'Portal360'

  useEffect(() => {
    document.title = `${actual} | Portal360`
    window.scrollTo(0, 0)
  }, [actual])

  useEffect(() => {
    if (!abierto) return
    const alPulsar = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false) }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [abierto])

  if (!rol || !usuario) return <Navigate to="/" replace />

  const elegir = (nuevo: Rol) => {
    cambiarRol(nuevo)
    if (nuevo === 'trabajador' && pathname === '/empleados') void navegar('/dashboard')
  }

  return (
    <div className="app">
      <a className="saltar" href="#contenido">Saltar al contenido</a>
      {abierto && <button type="button" className="velo" aria-label="Cerrar menú" onClick={() => setAbierto(false)} />}
      <aside id="menu" className={abierto ? 'lateral abierto' : 'lateral'}>
        <div className="marca">
          <Orbit size={28} aria-hidden /><span>Portal360</span>
          <button type="button" className="icono solo-movil" aria-label="Cerrar menú" onClick={() => setAbierto(false)}><X size={20} /></button>
        </div>
        <nav aria-label="Menú principal">
          {ENLACES.filter((e) => !e.soloAdmin || rol === 'admin').map(({ ruta, texto, icono: Icono }) => (
            <NavLink key={ruta} to={ruta} onClick={() => setAbierto(false)}><Icono size={20} aria-hidden />{texto}</NavLink>
          ))}
        </nav>
        <div className="pie-lateral">
          <Persona nombre={usuario.nombre} detalle={usuario.cargo} />
          <button type="button" className="salir" onClick={() => cambiarRol(null)}><LogOut size={18} aria-hidden />Salir de la demostración</button>
        </div>
      </aside>
      <div className="principal">
        <div className="barra-demo">
          <span><FlaskConical size={16} aria-hidden /><strong>Modo de demostración.</strong> Datos ficticios, sin autenticación real.</span>
          <div className="selector" role="group" aria-label="Ver como">
            {ROLES.map(([valor, texto]) => (
              <button type="button" key={valor} aria-pressed={rol === valor} onClick={() => elegir(valor)}>{texto}</button>
            ))}
          </div>
        </div>
        <div className="barra-movil">
          <button type="button" className="icono" aria-label="Abrir menú" aria-controls="menu" aria-expanded={abierto} onClick={() => setAbierto(true)}><Menu size={22} /></button>
          <strong>{actual}</strong>
        </div>
        <main id="contenido" tabIndex={-1}><Outlet /></main>
      </div>
    </div>
  )
}
