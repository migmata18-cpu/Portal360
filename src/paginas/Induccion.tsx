import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Campo, Encabezado, Etiqueta, Persona, Progreso, Vacio } from '@/componentes/Basicos'
import { Modal } from '@/componentes/Modal'
import { useDemo, useUsuario } from '@/contexto/demo'
import type { Tarea } from '@/tipos'
import { formatear, hoy } from '@/utilidades/fechas'

function Asignar({ cerrar }: { cerrar: () => void }) {
  const { empleados, asignarTarea, avisar } = useDemo()
  const [f, setF] = useState({ empleadoId: '', titulo: '', descripcion: '', limite: '' })
  const [er, setEr] = useState<Record<string, string>>({})

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const n: Record<string, string> = {}
    if (!f.empleadoId) n.empleadoId = 'Selecciona un empleado.'
    if (f.titulo.trim().length < 4) n.titulo = 'Escribe un título de al menos 4 caracteres.'
    if (!f.limite) n.limite = 'Indica la fecha límite.'
    else if (f.limite < hoy()) n.limite = 'La fecha límite no puede estar en el pasado.'
    setEr(n)
    if (Object.keys(n).length) return
    asignarTarea({ ...f, titulo: f.titulo.trim(), descripcion: f.descripcion.trim() })
    avisar('Tarea asignada.')
    cerrar()
  }

  return (
    <Modal titulo="Asignar tarea" cerrar={cerrar}>
      <form noValidate onSubmit={enviar}>
        <Campo etiqueta="Empleado" error={er.empleadoId}>
          <select value={f.empleadoId} onChange={(e) => setF({ ...f, empleadoId: e.target.value })}>
            <option value="">Selecciona</option>
            {empleados.filter((e) => e.activo).map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Título" error={er.titulo}><input maxLength={80} value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} /></Campo>
        <Campo etiqueta="Descripción (opcional)"><textarea rows={2} maxLength={300} value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} /></Campo>
        <Campo etiqueta="Fecha límite" error={er.limite}><input type="date" min={hoy()} value={f.limite} onChange={(e) => setF({ ...f, limite: e.target.value })} /></Campo>
        <div className="acciones"><button type="button" className="boton secundario" onClick={cerrar}>Cancelar</button><button className="boton">Asignar tarea</button></div>
      </form>
    </Modal>
  )
}

function ListaTareas({ tareas, editable }: { tareas: Tarea[]; editable: boolean }) {
  const { alternarTarea, avisar } = useDemo()
  return (
    <ul className="tareas">{tareas.map((t) => (
      <li key={t.id}>
        <label className={t.completada ? 'hecha' : ''}>
          <input type="checkbox" checked={t.completada} disabled={!editable} onChange={() => { alternarTarea(t.id); avisar(t.completada ? 'Tarea marcada como pendiente.' : 'Tarea completada.') }} />
          <span><strong>{t.titulo}</strong>{t.descripcion && <small>{t.descripcion}</small>}<small>Fecha límite: {formatear(t.limite)}</small></span>
        </label>
        <Etiqueta valor={t.completada ? 'Completada' : t.limite < hoy() ? 'Vencida' : 'Pendiente'} />
      </li>))}
    </ul>
  )
}

export function Induccion() {
  const { rol, empleados, tareas } = useDemo()
  const usuario = useUsuario()
  const admin = rol === 'admin'
  const [asignando, setAsignando] = useState(false)
  const grupos = empleados
    .filter((e) => (admin ? e.activo : e.id === usuario.id))
    .map((empleado) => ({ empleado, propias: tareas.filter((t) => t.empleadoId === empleado.id) }))
    .filter((g) => g.propias.length)

  return (
    <>
      <Encabezado titulo="Inducción" texto={admin ? 'Asigna tareas y sigue la integración del personal.' : 'Completa tus tareas de bienvenida.'}>
        {admin && <button type="button" className="boton" onClick={() => setAsignando(true)}><Plus size={18} aria-hidden />Asignar tarea</button>}
      </Encabezado>
      {grupos.length === 0 && <section className="tarjeta"><Vacio titulo="Sin tareas" texto="Aún no hay tareas de inducción asignadas." /></section>}
      <div className="pila">{grupos.map(({ empleado, propias }) => (
        <section className="tarjeta" key={empleado.id}>
          <div className="induccion-cabeza">
            <Persona nombre={empleado.nombre} detalle={empleado.cargo} />
            <Progreso nombre={empleado.nombre} hechas={propias.filter((t) => t.completada).length} total={propias.length} />
          </div>
          {admin
            ? <details><summary>Ver tareas</summary><ListaTareas tareas={propias} editable={false} /></details>
            : <ListaTareas tareas={propias} editable />}
        </section>))}
      </div>
      {asignando && admin && <Asignar cerrar={() => setAsignando(false)} />}
    </>
  )
}
