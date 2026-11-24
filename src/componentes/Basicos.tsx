import type { LucideIcon } from 'lucide-react'
import { Award, Ban, CircleCheck, CircleX, Clock3, HeartPulse, Inbox, Search, TimerOff } from 'lucide-react'
import { useId, type ReactElement, type ReactNode, cloneElement } from 'react'
import { iniciales } from '@/utilidades/texto'

const ESTILOS: Record<string, [string, LucideIcon]> = {
  Pendiente: ['ambar', Clock3],
  Aprobada: ['verde', CircleCheck],
  Rechazada: ['rojo', CircleX],
  Completada: ['verde', CircleCheck],
  Vencida: ['rojo', TimerOff],
  Activo: ['verde', CircleCheck],
  Inactivo: ['gris', Ban],
  Retardo: ['ambar', Clock3],
  Reposo: ['azul', HeartPulse],
  Reconocimiento: ['verde', Award],
}

export function Etiqueta({ valor }: { valor: string }) {
  const [color, Icono] = ESTILOS[valor] ?? ['gris', Clock3]
  return <span className={`etiqueta ${color}`}><Icono size={14} aria-hidden />{valor}</span>
}

export function Persona({ nombre, detalle }: { nombre: string; detalle?: string }) {
  return (
    <div className="persona">
      <span className="avatar" aria-hidden>{iniciales(nombre)}</span>
      <div><strong>{nombre}</strong>{detalle && <small>{detalle}</small>}</div>
    </div>
  )
}

export function Progreso({ hechas, total, nombre }: { hechas: number; total: number; nombre: string }) {
  const pct = total ? Math.round((hechas / total) * 100) : 0
  return (
    <div className="progreso">
      <div className="progreso-texto"><span>{hechas} de {total} tareas</span><strong>{pct} %</strong></div>
      <div className="barra" role="progressbar" aria-label={`Inducción de ${nombre}`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function Vacio({ titulo, texto, icono: Icono = Inbox }: { titulo: string; texto: string; icono?: LucideIcon }) {
  return <div className="vacio"><Icono size={32} aria-hidden /><strong>{titulo}</strong><p>{texto}</p></div>
}

export function Encabezado({ titulo, texto, children }: { titulo: string; texto: string; children?: ReactNode }) {
  return (
    <header className="encabezado">
      <div><h1>{titulo}</h1><p>{texto}</p></div>
      {children}
    </header>
  )
}

interface PropsControl { id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }

export function Campo({ etiqueta, error, children }: { etiqueta: string; error?: string; children: ReactElement<PropsControl> }) {
  const id = useId()
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      {cloneElement(children, { id, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : undefined })}
      {error && <span className="error" id={`${id}-error`} role="alert">{error}</span>}
    </div>
  )
}

export function Buscador({ valor, cambiar, texto }: { valor: string; cambiar: (v: string) => void; texto: string }) {
  return (
    <div className="buscador">
      <Search size={18} aria-hidden />
      <input type="search" aria-label={texto} placeholder={texto} value={valor} onChange={(e) => cambiar(e.target.value)} />
    </div>
  )
}

interface PropsFiltro { nombre: string; todos: string; opciones: string[]; valor: string; cambiar: (v: string) => void }

export function Filtro({ nombre, todos, opciones, valor, cambiar }: PropsFiltro) {
  return (
    <select aria-label={nombre} value={valor} onChange={(e) => cambiar(e.target.value)}>
      <option value="">{todos}</option>
      {opciones.map((o) => <option key={o}>{o}</option>)}
    </select>
  )
}
