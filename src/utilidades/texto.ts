export const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

export const iniciales = (nombre: string) =>
  nombre.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()

export const esCorreo = (texto: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto.trim())
