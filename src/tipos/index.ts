export type Rol = 'trabajador' | 'admin'
export type Departamento = 'Recursos Humanos' | 'Tecnología' | 'Ventas' | 'Finanzas' | 'Operaciones'
export type EstadoSolicitud = 'Pendiente' | 'Aprobada' | 'Rechazada'
export type TipoSolicitud = 'Vacaciones' | 'Permiso personal' | 'Permiso médico' | 'Permiso por estudios'
export type TipoIncidencia = 'Retardo' | 'Reposo' | 'Reconocimiento'

export interface Empleado {
  id: string
  nombre: string
  correo: string
  cargo: string
  departamento: Departamento
  ingreso: string
  diasVacaciones: number
  activo: boolean
}

export interface Solicitud {
  id: string
  empleadoId: string
  tipo: TipoSolicitud
  desde: string
  hasta: string
  motivo: string
  estado: EstadoSolicitud
  creada: string
  comentario?: string
}

export interface Tarea {
  id: string
  empleadoId: string
  titulo: string
  descripcion: string
  limite: string
  completada: boolean
}

export interface Incidencia {
  id: string
  empleadoId: string
  tipo: TipoIncidencia
  fecha: string
  descripcion: string
}
