// Las fechas se manejan como texto AAAA-MM-DD para evitar saltos por zona horaria.
export function aISO(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

function aFecha(iso: string): Date {
  const [anio, mes, dia] = iso.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

export const hoy = () => aISO(new Date())

export function desdeHoy(dias: number): string {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + dias)
  return aISO(fecha)
}

export const textoDias = (n: number) => (n === 1 ? '1 día hábil' : `${n} días hábiles`)

export function formatear(iso: string): string {
  return aFecha(iso).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Cuenta de lunes a viernes, ambos extremos incluidos. No descuenta feriados.
export function diasHabiles(desde: string, hasta: string): number {
  let total = 0
  const fin = aFecha(hasta)
  for (const d = aFecha(desde); d <= fin; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) total++
  }
  return total
}
