import type { LucideIcon } from 'lucide-react'
import { CalendarCheck, ClipboardCheck, Clock3, FileClock, Users } from 'lucide-react'
import { Link } from 'react-router'
import { Encabezado, Etiqueta, Persona, Progreso, Vacio } from '@/componentes/Basicos'
import { useDemo, useUsuario } from '@/contexto/demo'
import { desdeHoy, formatear } from '@/utilidades/fechas'

function Indicador({ titulo, valor, detalle, icono: Icono }: { titulo: string; valor: string | number; detalle: string; icono: LucideIcon }) {
  return (
    <article className="tarjeta indicador">
      <div><span>{titulo}</span><Icono size={20} aria-hidden /></div>
      <strong>{valor}</strong><small>{detalle}</small>
    </article>
  )
}

export function Dashboard() {
  const { rol, empleados, solicitudes, tareas, incidencias } = useDemo()
  const usuario = useUsuario()
  const admin = rol === 'admin'

  const misSolicitudes = admin ? solicitudes : solicitudes.filter((s) => s.empleadoId === usuario.id)
  const misIncidencias = admin ? incidencias : incidencias.filter((i) => i.empleadoId === usuario.id)
  const enInduccion = empleados.filter((e) => (admin || e.id === usuario.id) && e.activo && tareas.some((t) => t.empleadoId === e.id))
  const tareasVisibles = tareas.filter((t) => enInduccion.some((e) => e.id === t.empleadoId))
  const pendientes = misSolicitudes.filter((s) => s.estado === 'Pendiente').length
  const recientes = [...misSolicitudes].sort((a, b) => b.creada.localeCompare(a.creada)).slice(0, 5)
  const hechas = tareasVisibles.filter((t) => t.completada).length
  const avance = tareasVisibles.length ? `${Math.round((hechas / tareasVisibles.length) * 100)} %` : 'Sin tareas'
  const ultimoMes = misIncidencias.filter((i) => i.fecha >= desdeHoy(-30)).length
  const persona = (id: string) => empleados.find((e) => e.id === id)

  return (
    <>
      <Encabezado
        titulo={`Hola, ${usuario.nombre.split(' ')[0]}`}
        texto={admin ? 'Este es el estado de tu organización.' : 'Este es el resumen de tu actividad.'}
      />
      <section className="indicadores" aria-label="Indicadores">
        {admin
          ? <Indicador titulo="Empleados activos" valor={empleados.filter((e) => e.activo).length} detalle={`${empleados.length} fichas registradas`} icono={Users} />
          : <Indicador titulo="Vacaciones disponibles" valor={usuario.diasVacaciones} detalle="días hábiles" icono={CalendarCheck} />}
        <Indicador titulo="Solicitudes pendientes" valor={pendientes} detalle={admin ? 'por revisar' : 'en revisión'} icono={Clock3} />
        <Indicador titulo="Avance de inducción" valor={avance} detalle={`${hechas} de ${tareasVisibles.length} tareas`} icono={ClipboardCheck} />
        <Indicador titulo="Incidencias" valor={ultimoMes} detalle="en los últimos 30 días" icono={FileClock} />
      </section>
      <div className="dos-columnas">
        <section className="tarjeta">
          <div className="titulo-tarjeta"><h2>Solicitudes recientes</h2><Link to="/solicitudes">Ver todas</Link></div>
          {recientes.length === 0
            ? <Vacio titulo="Sin solicitudes" texto="Las solicitudes aparecerán aquí." />
            : <ul className="lista">{recientes.map((s) => (
                <li key={s.id}>
                  {admin
                    ? <Persona nombre={persona(s.empleadoId)?.nombre ?? 'Sin nombre'} detalle={`${s.tipo}, ${formatear(s.desde)}`} />
                    : <div><strong>{s.tipo}</strong><small>{formatear(s.desde)}</small></div>}
                  <Etiqueta valor={s.estado} />
                </li>))}
              </ul>}
        </section>
        <section className="tarjeta">
          <div className="titulo-tarjeta"><h2>Progreso de inducción</h2><Link to="/induccion">Ver detalle</Link></div>
          {enInduccion.length === 0
            ? <Vacio titulo="Sin inducciones" texto="No hay tareas asignadas." />
            : <ul className="lista vertical">{enInduccion.map((e) => {
                const propias = tareas.filter((t) => t.empleadoId === e.id)
                return (
                  <li key={e.id}>
                    <Persona nombre={e.nombre} detalle={e.cargo} />
                    <Progreso nombre={e.nombre} hechas={propias.filter((t) => t.completada).length} total={propias.length} />
                  </li>)
              })}</ul>}
        </section>
      </div>
    </>
  )
}
