import { createContext, useContext } from 'react'
import type { Empleado, EstadoSolicitud, Incidencia, Rol, Solicitud, Tarea } from '@/tipos'
import type { DatosSolicitud } from '@/utilidades/solicitudes'

export interface ContextoDemo {
  rol: Rol | null
  usuario: Empleado | null
  empleados: Empleado[]
  solicitudes: Solicitud[]
  tareas: Tarea[]
  incidencias: Incidencia[]
  aviso: { id: number; texto: string } | null
  cambiarRol: (rol: Rol | null) => void
  avisar: (texto: string) => void
  guardarEmpleado: (empleado: Empleado) => void
  crearSolicitud: (datos: DatosSolicitud) => void
  resolverSolicitud: (id: string, estado: EstadoSolicitud, comentario: string) => void
  asignarTarea: (tarea: Omit<Tarea, 'id' | 'completada'>) => void
  alternarTarea: (id: string) => void
  registrarIncidencia: (incidencia: Omit<Incidencia, 'id'>) => void
}

export const Contexto = createContext<ContextoDemo | null>(null)

export function useDemo(): ContextoDemo {
  const valor = useContext(Contexto)
  if (!valor) throw new Error('useDemo debe usarse dentro de ProveedorDemo.')
  return valor
}

// Para pantallas protegidas, donde siempre hay un usuario elegido.
export function useUsuario(): Empleado {
  const { usuario } = useDemo()
  if (!usuario) throw new Error('No hay un usuario de demostración activo.')
  return usuario
}
