import fs from 'fs'

const raw = fs.readFileSync('./ListaRetos.txt', 'utf8')
const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0)

const RETOS_CUSTOM = lines.map((line, i) => {
  let categoria = 'tonteria'
  const lower = line.toLowerCase()
  
  if (lower.includes('foto') || lower.includes('selfie') || lower.includes('dibujar') || lower.includes('calcetines') || lower.includes('cristal')) categoria = 'foto'
  else if (lower.includes('grabar') || lower.includes('audio') || lower.includes('cantar') || lower.includes('llamor') || lower.includes('caminando')) categoria = 'video'
  else if (lower.includes('escribir') || lower.includes('mensaje') || lower.includes('resumir') || lower.includes('documento')) categoria = 'texto'
  else if (lower.includes('adivinar') || lower.includes('pierde') || lower.includes('regla')) categoria = 'juego'
  
  // replace single quotes with escaped quotes
  const safeText = line.replace(/'/g, "\\'")
  
  return `  { id: 'r${61 + i}', texto: '${safeText}', categoria: '${categoria}', creadoPor: 'sistema', usado: false },`
})

const fileData = fs.readFileSync('./src/services/demoData.js', 'utf8')

// Insert the new challenges right before the end of RETOS_INICIALES array
const insertIndex = fileData.indexOf(']')
const header = '\n  // NUEVOS RETOS DEL USUARIO (ListaRetos.txt)\n'
const insertString = header + RETOS_CUSTOM.join('\n') + '\n'

const newFileData = fileData.slice(0, insertIndex) + insertString + fileData.slice(insertIndex)

fs.writeFileSync('./src/services/demoData.js', newFileData)
console.log('Extra challenges added to demoData.js')
