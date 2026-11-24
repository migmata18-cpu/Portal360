import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Buscador, Campo, Encabezado, Etiqueta, Filtro, Persona, Vacio } from '@/componentes/Basicos'
import { Modal } from '@/componentes/Modal'
import { useDemo, useUsuario } from '@/contexto/demo'
import { TIPOS_INCIDENCIA } from '@/datos/demo'
import type { TipoIncidencia } from '@/tipos'
import { formatear, hoy } from '@/utilidades/fechas'
import { normalizar } from '@/utilidades/texto'

function Registrar({ cerrar }: { cerrar: () => void }) {
  const { empleados, registrarIncidencia, avisar } = useDemo()
  const [f, setF] = useState({ empleadoId: '', tipo: 'Retardo' as TipoIncidencia, fecha: hoy(), descripcion: '' })
  const [er, setEr] = useState<Record<string, string>>({})

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const n: Record<string, string> = {}
    if (!f.empleadoId) n.empleadoId = 'Selecciona un empleado.'
    if (!f.fecha) n.fecha = 'Indica la fecha.'
    else if (f.fecha > hoy()) n.fecha = 'La fecha no puede ser futura.'
    if (f.descripcion.trim().length < 10) n.descripcion = 'Describe la incidencia con al menos 10 caracteres.'
    setEr(n)
    if (Object.keys(n).length) return
    registrarIncidencia({ ...f, descripcion: f.descripcion.trim() })
    avisar('Incidencia registrada.')
    cerrar()
  }

  return (
    <Modal titulo="Registrar incidencia" cerrar={cerrar}>
      <form noValidate onSubmit={enviar}>
        <Campo etiqueta="Empleado" error={er.empleadoId}>
          <select value={f.empleadoId} onChange={(e) => setF({ ...f, empleadoId: e.target.value })}>
            <option value="">Selecciona</option>
            {empleados.filter((e) => e.activo).map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </Campo>
        <div className="campos">
          <Campo etiqueta="Tipo"><select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value as TipoIncidencia })}>{TIPOS_INCIDENCIA.map((t) => <option key={t}>{t}</option>)}</select></Campo>
          <Campo etiqueta="Fecha" error={er.fecha}><input type="date" max={hoy()} value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></Campo>
        </div>
        <Campo etiqueta="Descripción" error={er.descripcion}><textarea rows={3} maxLength={300} value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} /></Campo>
        {f.tipo === 'Reposo' && <p className="nota">No incluyas diagnósticos ni detalles médicos.</p>}
        <div className="acciones"><button type="button" className="boton secundario" onClick={cerrar}>Cancelar</button><button className="boton">Registrar</button></div>
      </form>
    </Modal>
  )
}

export function Incidencias() {
  const { rol, empleados, incidencias } = useDemo()
  const usuario = useUsuario()
  const admin = rol === 'admin'
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState('')
  const [tipo, setTipo] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const rangoInvalido = !!desde && !!hasta && hasta < desde
  const nombre = (id: string) => empleados.find((e) => e.id === id)?.nombre ?? 'Sin nombre'

  const visibles = rangoInvalido ? [] : incidencias
    .filter((i) => (admin ? normalizar(nombre(i.empleadoId)).includes(normalizar(texto)) : i.empleadoId === usuario.id) && (!tipo || i.tipo === tipo) && (!desde || i.fecha >= desde) && (!hasta || i.fecha <= hasta))
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

  return (
    <>
      <Encabezado titulo="Histórico de incidencias" texto={admin ? 'Registra y consulta retardos, reposos y reconocimientos.' : 'Consulta tu historial laboral.'}>
        {admin && <button type="button" className="boton" onClick={() => setAbierto(true)}><Plus size={18} aria-hidden />Registrar incidencia</button>}
      </Encabezado>
      <section className="tarjeta">
        <div className="filtros">
          {admin && <Buscador valor={texto} cambiar={setTexto} texto="Buscar por empleado" />}
          <Filtro nombre="Tipo" todos="Todos los tipos" opciones={TIPOS_INCIDENCIA} valor={tipo} cambiar={setTipo} />
          <label className="rango">Desde<input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
          <label className="rango">Hasta<input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></label>
        </div>
        {rangoInvalido && <p className="error" role="alert">La fecha final debe ser igual o posterior a la inicial.</p>}
        {visibles.length === 0 ? <Vacio titulo="Sin incidencias" texto="No hay registros que coincidan con los filtros." /> : (
          <table>
            <thead><tr>{admin && <th>Empleado</th>}<th>Tipo</th><th>Fecha</th><th>Descripción</th></tr></thead>
            <tbody>{visibles.map((i) => (
              <tr key={i.id}>
                {admin && <td data-etiqueta="Empleado"><Persona nombre={nombre(i.empleadoId)} /></td>}
                <td data-etiqueta="Tipo"><Etiqueta valor={i.tipo} /></td>
                <td data-etiqueta="Fecha">{formatear(i.fecha)}</td>
                <td data-etiqueta="Descripción">{i.descripcion}</td>
              </tr>))}
            </tbody>
          </table>)}
      </section>
      {abierto && admin && <Registrar cerrar={() => setAbierto(false)} />}
    </>
  )
}
