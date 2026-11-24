import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

// <dialog> nativo: gestiona el foco y la tecla Escape.
export function Modal({ titulo, cerrar, children }: { titulo: string; cerrar: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()

  useEffect(() => {
    const dialogo = ref.current
    dialogo?.showModal()
    return () => dialogo?.close()
  }, [])

  return (
    <dialog ref={ref} aria-labelledby={id} onCancel={(e) => { e.preventDefault(); cerrar() }}>
      <header>
        <h2 id={id}>{titulo}</h2>
        <button type="button" className="icono" aria-label="Cerrar ventana" onClick={cerrar}><X size={20} /></button>
      </header>
      {children}
    </dialog>
  )
}
