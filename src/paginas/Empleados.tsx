import { Pencil, UserCheck, UserX } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Buscador, Campo, Encabezado, Etiqueta, Filtro, Persona, Vacio } from '@/componentes/Basicos'
import { Modal } from '@/componentes/Modal'
import { useDemo, useUsuario } from '@/contexto/demo'
import { DEPARTAMENTOS } from '@/datos/demo'
import type { Departamento, Empleado } from '@/tipos'
import { formatear } from '@/utilidades/fechas'
import { esCorreo, normalizar } from '@/utilidades/texto'

function Editar({ empleado, cerrar }: { empleado: Empleado; cerrar: () => void }) {
  const { empleados, guardarEmpleado, avisar } = useDemo()
  const [f, setF] = useState(empleado)
  const [dias, setDias] = useState(String(empleado.diasVacaciones))
  const [errores, setErrores] = useState<Record<string, string>>({})

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    const n = Number(dias)
    const correo = f.correo.trim().toLowerCase()
    if (f.nombre.trim().length < 3) er.nombre = 'Escribe el nombre completo.'
    if (!esCorreo(correo)) er.correo = 'Escribe un correo válido.'
    else if (empleados.some((x) => x.id !== f.id && x.correo.toLowerCase() === correo)) er.correo = 'Ese correo ya pertenece a otra ficha.'
    if (f.cargo.trim().length < 2) er.cargo = 'Escribe el cargo.'
    if (dias.trim() === '' || !Number.isInteger(n) || n < 0 || n > 60) er.dias = 'Indica un número entero entre 0 y 60.'
    setErrores(er)
    if (Object.keys(er).length) return
    guardarEmpleado({ ...f, nombre: f.nombre.trim(), cargo: f.cargo.trim(), correo, diasVacaciones: n })
    avisar('Ficha actualizada.')
    cerrar()
  }

  return (
    <Modal titulo="Editar ficha" cerrar={cerrar}>
      <form noValidate onSubmit={enviar}>
        <Campo etiqueta="Nombre completo" error={errores.nombre}><input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></Campo>
        <Campo etiqueta="Correo electrónico" error={errores.correo}><input type="email" value={f.correo} onChange={(e) => setF({ ...f, correo: e.target.value })} /></Campo>
        <div className="campos">
          <Campo etiqueta="Cargo" error={errores.cargo}><input value={f.cargo} onChange={(e) => setF({ ...f, cargo: e.target.value })} /></Campo>
          <Campo etiqueta="Departamento">
            <select value={f.departamento} onChange={(e) => setF({ ...f, departamento: e.target.value as Departamento })}>
              {DEPARTAMENTOS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Campo>
        </div>
        <Campo etiqueta="Días de vacaciones disponibles" error={errores.dias}><input type="number" min="0" max="60" value={dias} onChange={(e) => setDias(e.target.value)} /></Campo>
        <div className="acciones"><button type="button" className="boton secundario" onClick={cerrar}>Cancelar</button><button className="boton">Guardar cambios</button></div>
      </form>
    </Modal>
  )
}

export function Empleados() {
  const { empleados, guardarEmpleado, avisar } = useDemo()
  const usuario = useUsuario()
  const [texto, setTexto] = useState('')
  const [depto, setDepto] = useState('')
  const [estado, setEstado] = useState('')
  const [editando, setEditando] = useState<Empleado | null>(null)
  const [cambiando, setCambiando] = useState<Empleado | null>(null)

  const visibles = empleados.filter((e) =>
    normalizar(`${e.nombre} ${e.correo} ${e.cargo}`).includes(normalizar(texto)) &&
    (!depto || e.departamento === depto) &&
    (!estado || (e.activo ? 'Activo' : 'Inactivo') === estado))

  const confirmar = () => {
    if (!cambiando) return
    guardarEmpleado({ ...cambiando, activo: !cambiando.activo })
    avisar(cambiando.activo ? 'Empleado desactivado.' : 'Empleado reactivado.')
    setCambiando(null)
  }

  return (
    <>
      <Encabezado titulo="Gestión de empleados" texto="Consulta y actualiza las fichas del personal." />
      <section className="tarjeta">
        <div className="filtros">
          <Buscador valor={texto} cambiar={setTexto} texto="Buscar por nombre, correo o cargo" />
          <Filtro nombre="Departamento" todos="Todos los departamentos" opciones={DEPARTAMENTOS} valor={depto} cambiar={setDepto} />
          <Filtro nombre="Estado" todos="Todos los estados" opciones={['Activo', 'Inactivo']} valor={estado} cambiar={setEstado} />
        </div>
        <p className="conteo" role="status">{visibles.length} de {empleados.length} empleados</p>
        {visibles.length === 0 ? <Vacio titulo="Sin resultados" texto="Prueba con otra búsqueda o cambia los filtros." /> : (
          <table>
            <thead><tr><th>Empleado</th><th>Cargo</th><th>Departamento</th><th>Ingreso</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{visibles.map((e) => (
              <tr key={e.id}>
                <td data-etiqueta="Empleado"><Persona nombre={e.nombre} detalle={e.correo} /></td>
                <td data-etiqueta="Cargo">{e.cargo}</td>
                <td data-etiqueta="Departamento">{e.departamento}</td>
                <td data-etiqueta="Ingreso">{formatear(e.ingreso)}</td>
                <td data-etiqueta="Estado"><Etiqueta valor={e.activo ? 'Activo' : 'Inactivo'} /></td>
                <td data-etiqueta="Acciones"><div className="botones">
                  <button type="button" className="icono" title="Editar" aria-label={`Editar a ${e.nombre}`} onClick={() => setEditando(e)}><Pencil size={18} /></button>
                  <button type="button" className="icono" disabled={e.id === usuario.id} title={e.id === usuario.id ? 'No puedes desactivar tu propia ficha' : e.activo ? 'Desactivar' : 'Reactivar'} aria-label={`${e.activo ? 'Desactivar' : 'Reactivar'} a ${e.nombre}`} onClick={() => setCambiando(e)}>
                    {e.activo ? <UserX size={18} /> : <UserCheck size={18} />}
                  </button>
                </div></td>
              </tr>))}
            </tbody>
          </table>)}
      </section>
      {editando && <Editar empleado={editando} cerrar={() => setEditando(null)} />}
      {cambiando && (
        <Modal titulo={cambiando.activo ? 'Desactivar empleado' : 'Reactivar empleado'} cerrar={() => setCambiando(null)}>
          <p>{cambiando.activo ? `${cambiando.nombre} no podrá recibir nuevas tareas ni incidencias. Su historial se conservará.` : `${cambiando.nombre} volverá a estar disponible.`}</p>
          <div className="acciones">
            <button type="button" className="boton secundario" onClick={() => setCambiando(null)}>Cancelar</button>
            <button type="button" className={cambiando.activo ? 'boton peligro' : 'boton'} onClick={confirmar}>{cambiando.activo ? 'Desactivar' : 'Reactivar'}</button>
          </div>
        </Modal>)}
    </>
  )
}
