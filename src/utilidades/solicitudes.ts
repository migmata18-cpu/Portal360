import type { Empleado, Solicitud, TipoSolicitud } from '@/tipos'
import { diasHabiles, hoy, textoDias } from './fechas'

export interface DatosSolicitud {
  tipo: TipoSolicitud
  desde: string
  hasta: string
  motivo: string
}

export type Errores<T> = Partial<Record<keyof T, string>>

export function validarSolicitud(
  datos: DatosSolicitud,
  empleado: Empleado,
  propias: Solicitud[],
): Errores<DatosSolicitud> {
  const errores: Errores<DatosSolicitud> = {}
  const { tipo, desde, hasta, motivo } = datos

  if (!desde) errores.desde = 'Indica la fecha de inicio.'
  else if (desde < hoy()) errores.desde = 'La fecha de inicio no puede estar en el pasado.'
  if (!hasta) errores.hasta = 'Indica la fecha de fin.'
  else if (desde && hasta < desde) errores.hasta = 'La fecha de fin debe ser igual o posterior al inicio.'
  if (motivo.trim().length < 10) errores.motivo = 'Describe el motivo con al menos 10 caracteres.'

  if (!errores.desde && !errores.hasta) {
    const dias = diasHabiles(desde, hasta)
    const pendientes = propias
      .filter((s) => s.tipo === 'Vacaciones' && s.estado === 'Pendiente')
      .reduce((total, s) => total + diasHabiles(s.desde, s.hasta), 0)
    const libres = empleado.diasVacaciones - pendientes
    const solapada = propias.some((s) => s.estado !== 'Rechazada' && desde <= s.hasta && hasta >= s.desde)

    if (dias === 0) errores.hasta = 'El período debe incluir al menos un día hábil.'
    else if (solapada) errores.desde = 'Ya tienes una solicitud en esas fechas.'
    else if (tipo === 'Vacaciones' && dias > libres)
      errores.hasta = `Solicitas ${textoDias(dias)} y tienes ${Math.max(0, libres)} sin comprometer.`
  }
  return errores
}
