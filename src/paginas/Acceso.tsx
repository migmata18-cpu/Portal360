import { FlaskConical, Info, Orbit, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Campo } from '@/componentes/Basicos'
import { useDemo } from '@/contexto/demo'
import { esCorreo } from '@/utilidades/texto'

export function Acceso() {
  const { cambiarRol } = useDemo()
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [errores, setErrores] = useState<{ correo?: string; clave?: string }>({})
  const [mensaje, setMensaje] = useState(false)

  useEffect(() => { document.title = 'Iniciar sesión | Portal360' }, [])

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const nuevos = {
      correo: esCorreo(correo) ? undefined : 'Escribe un correo válido.',
      clave: clave ? undefined : 'Escribe una contraseña.',
    }
    setErrores(nuevos)
    setMensaje(!nuevos.correo && !nuevos.clave)
    setClave('')
  }

  return (
    <div className="acceso">
      <section className="acceso-marca">
        <div className="marca"><Orbit size={32} aria-hidden /><span>Portal360</span></div>
        <div>
          <h2>La gestión de tu equipo, en un solo lugar.</h2>
          <p>Permisos, vacaciones, inducción e incidencias con información clara para cada persona.</p>
        </div>
        <small>Proyecto universitario, UCAB</small>
      </section>
      <main className="acceso-panel">
        <div className="acceso-caja">
          <h1>Iniciar sesión</h1>
          <p className="suave">Accede a tu espacio de Recursos Humanos.</p>
          <form noValidate onSubmit={enviar}>
            <Campo etiqueta="Correo electrónico" error={errores.correo}>
              <input type="email" autoComplete="off" value={correo} onChange={(e) => setCorreo(e.target.value)} />
            </Campo>
            <Campo etiqueta="Contraseña" error={errores.clave}>
              <input type="password" autoComplete="off" value={clave} onChange={(e) => setClave(e.target.value)} />
            </Campo>
            <button className="boton" type="submit">Iniciar sesión</button>
            {mensaje && <p className="nota" role="status"><Info size={18} aria-hidden />El inicio de sesión real aún no está disponible. Usa los accesos de demostración.</p>}
          </form>
          <section className="demo-caja" aria-labelledby="demo-titulo">
            <h2 id="demo-titulo"><FlaskConical size={18} aria-hidden />Modo de demostración</h2>
            <p>No es autenticación real y usa datos ficticios. No escribas contraseñas verdaderas.</p>
            <button type="button" className="boton secundario" onClick={() => cambiarRol('trabajador')}><UserRound size={18} aria-hidden />Ver como trabajador</button>
            <button type="button" className="boton secundario" onClick={() => cambiarRol('admin')}><ShieldCheck size={18} aria-hidden />Ver como administrador</button>
          </section>
        </div>
      </main>
    </div>
  )
}
