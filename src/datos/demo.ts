// Datos completamente ficticios. Se reemplazarán por Supabase.
import type { Departamento, Empleado, Incidencia, Solicitud, Tarea, TipoIncidencia, TipoSolicitud } from '@/tipos'
import { desdeHoy } from '@/utilidades/fechas'

export const DEPARTAMENTOS: Departamento[] = ['Recursos Humanos', 'Tecnología', 'Ventas', 'Finanzas', 'Operaciones']
export const TIPOS_SOLICITUD: TipoSolicitud[] = ['Vacaciones', 'Permiso personal', 'Permiso médico', 'Permiso por estudios']
export const TIPOS_INCIDENCIA: TipoIncidencia[] = ['Retardo', 'Reposo', 'Reconocimiento']

export const ID_POR_ROL = { trabajador: 'e2', admin: 'e1' } as const

const emp = (
  id: string, nombre: string, usuario: string, cargo: string,
  departamento: Departamento, antiguedad: number, diasVacaciones: number, activo = true,
): Empleado => ({
  id, nombre, correo: `${usuario}@portal360.example`, cargo, departamento,
  ingreso: desdeHoy(-antiguedad), diasVacaciones, activo,
})

export const empleadosDemo: Empleado[] = [
  emp('e1', 'Valeria Rojas', 'valeria.rojas', 'Gerente de RR. HH.', 'Recursos Humanos', 1600, 18),
  emp('e2', 'Luis Fernández', 'luis.fernandez', 'Analista de soporte', 'Tecnología', 14, 15),
  emp('e3', 'Camila Torres', 'camila.torres', 'Ejecutiva comercial', 'Ventas', 8, 15),
  emp('e4', 'Andrés Medina', 'andres.medina', 'Contador', 'Finanzas', 900, 12),
  emp('e5', 'Mariana Silva', 'mariana.silva', 'Coordinadora logística', 'Operaciones', 720, 9),
  emp('e6', 'José Paredes', 'jose.paredes', 'Desarrollador web', 'Tecnología', 480, 14),
  emp('e7', 'Daniela Núñez', 'daniela.nunez', 'Analista de selección', 'Recursos Humanos', 21, 15),
  emp('e8', 'Ricardo Blanco', 'ricardo.blanco', 'Supervisor de almacén', 'Operaciones', 1300, 6),
  emp('e9', 'Sofía Herrera', 'sofia.herrera', 'Asesora de ventas', 'Ventas', 1000, 4, false),
]

export const solicitudesDemo: Solicitud[] = [
  { id: 's1', empleadoId: 'e2', tipo: 'Permiso por estudios', desde: desdeHoy(9), hasta: desdeHoy(11), motivo: 'Presentación de exámenes finales.', estado: 'Pendiente', creada: desdeHoy(-1) },
  { id: 's2', empleadoId: 'e5', tipo: 'Vacaciones', desde: desdeHoy(20), hasta: desdeHoy(26), motivo: 'Viaje familiar programado.', estado: 'Pendiente', creada: desdeHoy(-2) },
  { id: 's3', empleadoId: 'e6', tipo: 'Permiso personal', desde: desdeHoy(4), hasta: desdeHoy(6), motivo: 'Trámite de documentos personales.', estado: 'Pendiente', creada: desdeHoy(-3) },
  { id: 's4', empleadoId: 'e4', tipo: 'Vacaciones', desde: desdeHoy(30), hasta: desdeHoy(37), motivo: 'Descanso anual correspondiente.', estado: 'Aprobada', creada: desdeHoy(-6), comentario: 'Aprobada. Coordina la entrega de pendientes.' },
  { id: 's5', empleadoId: 'e8', tipo: 'Permiso personal', desde: desdeHoy(-5), hasta: desdeHoy(-3), motivo: 'Asunto familiar.', estado: 'Rechazada', creada: desdeHoy(-12), comentario: 'Coincide con el inventario general.' },
  { id: 's6', empleadoId: 'e2', tipo: 'Permiso médico', desde: desdeHoy(-6), hasta: desdeHoy(-4), motivo: 'Consulta médica de control.', estado: 'Aprobada', creada: desdeHoy(-9), comentario: 'Aprobada.' },
]

const PLAN: [string, string][] = [
  ['Completar datos personales', 'Revisa y confirma los datos de tu ficha.'],
  ['Leer el manual de convivencia', 'Conoce las normas y los valores de la empresa.'],
  ['Conocer al equipo', 'Reunión de bienvenida con tu departamento.'],
  ['Curso de seguridad laboral', 'Completa la formación introductoria.'],
  ['Definir objetivos iniciales', 'Acuerda con tu supervisor las metas del primer mes.'],
]

const plan = (empleadoId: string, completadas: number, inicio: number): Tarea[] =>
  PLAN.map(([titulo, descripcion], i) => ({
    id: `${empleadoId}-t${i}`, empleadoId, titulo, descripcion,
    limite: desdeHoy(inicio + i * 4), completada: i < completadas,
  }))

export const tareasDemo: Tarea[] = [...plan('e2', 2, -9), ...plan('e3', 1, -1), ...plan('e7', 5, -18)]

export const incidenciasDemo: Incidencia[] = [
  { id: 'i1', empleadoId: 'e2', tipo: 'Reconocimiento', fecha: desdeHoy(-2), descripcion: 'Excelente disposición durante su primera semana.' },
  { id: 'i2', empleadoId: 'e6', tipo: 'Retardo', fecha: desdeHoy(-3), descripcion: 'Llegada 25 minutos después de la hora establecida.' },
  { id: 'i3', empleadoId: 'e5', tipo: 'Reconocimiento', fecha: desdeHoy(-8), descripcion: 'Mejora del proceso de despacho.' },
  { id: 'i4', empleadoId: 'e2', tipo: 'Retardo', fecha: desdeHoy(-10), descripcion: 'Llegada 15 minutos tarde por fallas de transporte.' },
  { id: 'i5', empleadoId: 'e8', tipo: 'Reposo', fecha: desdeHoy(-15), descripcion: 'Reposo de dos días, soporte consignado.' },
  { id: 'i6', empleadoId: 'e4', tipo: 'Reposo', fecha: desdeHoy(-40), descripcion: 'Reposo de un día, soporte consignado.' },
]
