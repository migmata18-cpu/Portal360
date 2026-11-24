import { Check, Plus, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Buscador, Campo, Encabezado, Etiqueta, Filtro, Persona, Vacio } from '@/componentes/Basicos'
import { Modal } from '@/componentes/Modal'
import { useDemo, useUsuario } from '@/contexto/demo'
import { TIPOS_SOLICITUD } from '@/datos/demo'
import type { Solicitud, TipoSolicitud } from '@/tipos'
import { diasHabiles, formatear, hoy, textoDias } from '@/utilidades/fechas'
import { validarSolicitud, type DatosSolicitud, type Errores } from '@/utilidades/solicitudes'
import { normalizar } from '@/utilidades/texto'

function Nueva({ cerrar }: { cerrar: () => void }) {
  const { solicitudes, crearSolicitud, avisar } = useDemo()
  const usuario = useUsuario()
  const [f, setF] = useState<DatosSolicitud>({ tipo: 'Vacaciones', desde: '', hasta: '', motivo: '' })
  const [errores, setErrores] = useState<Errores<DatosSolicitud>>({})

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const er = validarSolicitud(f, usuario, solicitudes.filter((s) => s.empleadoId === usuario.id))
    setErrores(er)
    if (Object.keys(er).length) return
    crearSolicitud(f)
    avisar('Solicitud enviada a Recursos Humanos.')
    cerrar()
  }

  return (
    <Modal titulo="Nueva solicitud" cerrar={cerrar}>
      <form noValidate onSubmit={enviar}>
        <Campo etiqueta="Tipo de solicitud">
          <select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value as TipoSolicitud })}>{TIPOS_SOLICITUD.map((t) => <option key={t}>{t}</option>)}</select>
        </Campo>
        <div className="campos">
          <Campo etiqueta="Desde" error={errores.desde}><input type="date" min={hoy()} value={f.desde} onChange={(e) => setF({ ...f, desde: e.target.value })} /></Campo>
          <Campo etiqueta="Hasta" error={errores.hasta}><input type="date" min={f.desde || hoy()} value={f.hasta} onChange={(e) => setF({ ...f, hasta: e.target.value })} /></Campo>
        </div>
        {f.desde && f.hasta >= f.desde && <p className="nota">{textoDias(diasHabiles(f.desde, f.hasta))}, de lunes a viernes y sin descontar feriados.</p>}
        <Campo etiqueta="Motivo" error={errores.motivo}><textarea rows={3} maxLength={300} value={f.motivo} onChange={(e) => setF({ ...f, motivo: e.target.value })} /></Campo>
        <div className="acciones"><button type="button" className="boton secundario" onClick={cerrar}>Cancelar</button><button className="boton">Enviar solicitud</button></div>
      </form>
    </Modal>
  )
}

function Resolver({ solicitud, nombre, aprobar, cerrar }: { solicitud: Solicitud; nombre: string; aprobar: boolean; cerrar: () => void }) {
  const { empleados, resolverSolicitud, avisar } = useDemo()
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState('')
  const dias = diasHabiles(solicitud.desde, solicitud.hasta)
  const saldo = empleados.find((e) => e.id === solicitud.empleadoId)?.diasVacaciones ?? 0

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    if (!aprobar && comentario.trim().length < 5) return setError('Explica el motivo del rechazo.')
    if (aprobar && solicitud.tipo === 'Vacaciones' && dias > saldo) return setError(`No hay saldo suficiente: quedan ${saldo} días.`)
    resolverSolicitud(solicitud.id, aprobar ? 'Aprobada' : 'Rechazada', comentario)
    avisar(aprobar ? 'Solicitud aprobada.' : 'Solicitud rechazada.')
    cerrar()
  }

  return (
    <Modal titulo={aprobar ? 'Aprobar solicitud' : 'Rechazar solicitud'} cerrar={cerrar}>
      <form noValidate onSubmit={enviar}>
        <p><strong>{nombre}</strong>: {solicitud.tipo}, {textoDias(dias)}. {solicitud.motivo}</p>
        <Campo etiqueta={aprobar ? 'Comentario (opcional)' : 'Motivo del rechazo'} error={error}><textarea rows={3} maxLength={300} value={comentario} onChange={(e) => setComentario(e.target.value)} /></Campo>
        <div className="acciones"><button type="button" className="boton secundario" onClick={cerrar}>Cancelar</button><button className={aprobar ? 'boton' : 'boton peligro'}>{aprobar ? 'Confirmar aprobación' : 'Confirmar rechazo'}</button></div>
      </form>
    </Modal>
  )
}

export function Solicitudes() {
  const { rol, empleados, solicitudes } = useDemo()
  const usuario = useUsuario()
  const admin = rol === 'admin'
  const [nueva, setNueva] = useState(false)
  const [accion, setAccion] = useState<{ solicitud: Solicitud; aprobar: boolean } | null>(null)
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState('')
  const [tipo, setTipo] = useState('')
  const nombre = (id: string) => empleados.find((e) => e.id === id)?.nombre ?? 'Sin nombre'

  const visibles = solicitudes
    .filter((s) => (admin ? normalizar(nombre(s.empleadoId)).includes(normalizar(texto)) : s.empleadoId === usuario.id) && (!estado || s.estado === estado) && (!tipo || s.tipo === tipo))
    .sort((a, b) => b.creada.localeCompare(a.creada))

  return (
    <>
      <Encabezado titulo="Permisos y vacaciones" texto={admin ? 'Revisa y responde las solicitudes del personal.' : `Tienes ${textoDias(usuario.diasVacaciones)} de vacaciones.`}>
        {!admin && <button type="button" className="boton" onClick={() => setNueva(true)}><Plus size={18} aria-hidden />Nueva solicitud</button>}
      </Encabezado>
      <section className="tarjeta">
        <div className="filtros">
          {admin && <Buscador valor={texto} cambiar={setTexto} texto="Buscar por empleado" />}
          <Filtro nombre="Estado" todos="Todos los estados" opciones={['Pendiente', 'Aprobada', 'Rechazada']} valor={estado} cambiar={setEstado} />
          <Filtro nombre="Tipo" todos="Todos los tipos" opciones={TIPOS_SOLICITUD} valor={tipo} cambiar={setTipo} />
        </div>
        {visibles.length === 0 ? <Vacio titulo="Sin solicitudes" texto="No hay solicitudes que coincidan." /> : (
          <table>
            <thead><tr>{admin && <th>Empleado</th>}<th>Tipo</th><th>Período</th><th>Motivo</th><th>Estado</th>{admin && <th>Acciones</th>}</tr></thead>
            <tbody>{visibles.map((s) => (
              <tr key={s.id}>
                {admin && <td data-etiqueta="Empleado"><Persona nombre={nombre(s.empleadoId)} /></td>}
                <td data-etiqueta="Tipo">{s.tipo}</td>
                <td data-etiqueta="Período"><div>{formatear(s.desde)} al {formatear(s.hasta)}<small>{textoDias(diasHabiles(s.desde, s.hasta))}</small></div></td>
                <td data-etiqueta="Motivo"><div>{s.motivo}{s.comentario && <small>RR. HH.: {s.comentario}</small>}</div></td>
                <td data-etiqueta="Estado"><Etiqueta valor={s.estado} /></td>
                {admin && <td data-etiqueta="Acciones">{s.estado !== 'Pendiente' ? <span className="suave">Resuelta</span> : s.empleadoId === usuario.id ? <span className="suave">Solicitud propia</span> : (
                  <div className="botones">
                    <button type="button" className="icono" title="Aprobar" aria-label={`Aprobar solicitud de ${nombre(s.empleadoId)}`} onClick={() => setAccion({ solicitud: s, aprobar: true })}><Check size={18} /></button>
                    <button type="button" className="icono" title="Rechazar" aria-label={`Rechazar solicitud de ${nombre(s.empleadoId)}`} onClick={() => setAccion({ solicitud: s, aprobar: false })}><X size={18} /></button>
                  </div>)}</td>}
              </tr>))}
            </tbody>
          </table>)}
      </section>
      {nueva && !admin && <Nueva cerrar={() => setNueva(false)} />}
      {accion && <Resolver {...accion} nombre={nombre(accion.solicitud.empleadoId)} cerrar={() => setAccion(null)} />}
    </>
  )
}
