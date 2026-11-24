import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { empleadosDemo, ID_POR_ROL, incidenciasDemo, solicitudesDemo, tareasDemo } from '@/datos/demo'
import type { Rol } from '@/tipos'
import { diasHabiles, hoy } from '@/utilidades/fechas'
import { Contexto, type ContextoDemo } from './demo'

const CLAVE = 'portal360-rol-demo'

function leerRol(): Rol | null {
  try {
    const valor = sessionStorage.getItem(CLAVE)
    return valor === 'admin' || valor === 'trabajador' ? valor : null
  } catch {
    return null
  }
}

// MODO DE DEMOSTRACIÓN: guarda el rol elegido, pero no autentica ni protege datos.
export function ProveedorDemo({ children }: { children: ReactNode }) {
  const [rol, setRol] = useState<Rol | null>(leerRol)
  const [empleados, setEmpleados] = useState(empleadosDemo)
  const [solicitudes, setSolicitudes] = useState(solicitudesDemo)
  const [tareas, setTareas] = useState(tareasDemo)
  const [incidencias, setIncidencias] = useState(incidenciasDemo)
  const [aviso, setAviso] = useState<ContextoDemo['aviso']>(null)

  const avisar = useCallback((texto: string) => setAviso({ id: Date.now(), texto }), [])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 4500)
    return () => clearTimeout(t)
  }, [aviso])

  const usuario = rol ? (empleados.find((e) => e.id === ID_POR_ROL[rol]) ?? null) : null

  const valor: ContextoDemo = {
    rol, usuario, empleados, solicitudes, tareas, incidencias, aviso, avisar,
    cambiarRol(nuevo) {
      setRol(nuevo)
      try {
        if (nuevo) sessionStorage.setItem(CLAVE, nuevo)
        else sessionStorage.removeItem(CLAVE)
      } catch {
        // Sin almacenamiento, el rol dura hasta recargar la página.
      }
    },
    guardarEmpleado(empleado) {
      setEmpleados((l) => l.map((e) => (e.id === empleado.id ? empleado : e)))
    },
    crearSolicitud(datos) {
      if (!usuario) return
      const nueva = {
        ...datos, motivo: datos.motivo.trim(), id: crypto.randomUUID(),
        empleadoId: usuario.id, estado: 'Pendiente' as const, creada: hoy(),
      }
      setSolicitudes((l) => [nueva, ...l])
    },
    resolverSolicitud(id, estado, comentario) {
      const solicitud = solicitudes.find((s) => s.id === id)
      if (!solicitud || solicitud.estado !== 'Pendiente') return
      setSolicitudes((l) => l.map((s) => (s.id === id ? { ...s, estado, comentario: comentario.trim() || undefined } : s)))
      if (estado === 'Aprobada' && solicitud.tipo === 'Vacaciones') {
        const dias = diasHabiles(solicitud.desde, solicitud.hasta)
        setEmpleados((l) => l.map((e) =>
          e.id === solicitud.empleadoId ? { ...e, diasVacaciones: Math.max(0, e.diasVacaciones - dias) } : e))
      }
    },
    asignarTarea(tarea) {
      setTareas((l) => [...l, { ...tarea, id: crypto.randomUUID(), completada: false }])
    },
    alternarTarea(id) {
      setTareas((l) => l.map((t) => (t.id === id ? { ...t, completada: !t.completada } : t)))
    },
    registrarIncidencia(incidencia) {
      setIncidencias((l) => [{ ...incidencia, id: crypto.randomUUID() }, ...l])
    },
  }

  return <Contexto value={valor}>{children}</Contexto>
}
