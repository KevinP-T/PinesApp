import { CURRENT_VERSION } from './pinitSchema.js'

// ────────────────────────────────────────────────────────────────────────────
// Módulos PUROS de migración de datos de Pinit.
// Sin DOM, sin fs: todas las funciones son deterministas y testeables.
// ────────────────────────────────────────────────────────────────────────────

const IMG_ARRAYS = ['pins', 'bleedImages', 'originals']

// Reemplaza cualquier string que empiece con 'blob:' por null en los 3 arrays.
// NO muta el objeto original: devuelve un nuevo objeto.
export function sanitizeBlobs(data) {
  if (!data || typeof data !== 'object') return data
  const out = { ...data }
  for (const key of IMG_ARRAYS) {
    const arr = out[key]
    if (Array.isArray(arr)) {
      out[key] = arr.map((item) =>
        typeof item === 'string' && item.startsWith('blob:') ? null : item
      )
    }
  }
  return out
}

// Deriva el modo de sangrado a partir del margen de sangrado en mm.
// Tolerancia de ±1mm; cualquier otro valor (o undefined) → '3mm' por defecto.
export function deriveBleedMode(bleedMm) {
  if (bleedMm === undefined || bleedMm === null) return '3mm'
  if (Math.abs(bleedMm - 3) < 1) return '3mm'
  if (Math.abs(bleedMm - 6) < 1) return '6mm'
  return '3mm'
}

// Migra un .pinit de V1 → V2 de forma idempotente.
// NUNCA toca pinDiamMm/bleedMm/grid*/gap* (medidas originales).
export function migratePinitV1toV2(data) {
  if (!data) data = {}
  data.version = 2
  data.config = data.config ?? {}
  data.config.unit ??= 'mm'
  data.config.sheet ??= 'A4'
  data.config.bleedMode ??= deriveBleedMode(data.config.bleedMm)
  data.pins ??= []
  data.bleedImages ??= []
  data.originals ??= []
  if (typeof data.exportedAt !== 'number') data.exportedAt = Date.now()
  return data
}

// Migra una plantilla de V1 → V2 de forma idempotente.
// NUNCA toca las medidas físicas.
export function migrateTemplateV1toV2(obj) {
  if (!obj) obj = {}
  obj.version = 2
  obj.unit ??= 'mm'
  obj.sheet ??= 'A4'
  obj.bleedMode ??= deriveBleedMode(obj.bleedMm)
  return obj
}

// Repada/recorta los 3 arrays de imágenes a exactamente cols*rows.
// Si son más cortos → rellena con null; si son más largos → recorta
// conservando los primeros elementos en sus posiciones.
export function repairArrays(data) {
  if (!data || !data.config) return data
  const { gridCols, gridRows } = data.config
  if (!Number.isInteger(gridCols) || !Number.isInteger(gridRows)) return data
  const size = gridCols * gridRows
  for (const key of IMG_ARRAYS) {
    let arr = Array.isArray(data[key]) ? data[key] : []
    if (arr.length < size) {
      arr = [...arr, ...Array(size - arr.length).fill(null)]
    } else if (arr.length > size) {
      arr = arr.slice(0, size)
    }
    data[key] = arr
  }
  return data
}

// ¿El dato corresponde a una versión futura (más nueva) que la actual?
// undefined → false. Cualquier versión > current → true.
export function isFutureVersion(data, current = CURRENT_VERSION) {
  const v = Number(data?.version)
  if (Number.isNaN(v)) return false
  return v > current
}

// Carga templates.json de forma segura con recuperación desde .bak.
// rawText: contenido del archivo principal.
// readBak(): función que devuelve string del .bak o null.
// Devuelve un array migrado a V2 (o [] si todo falla).
export function loadTemplatesSafe(rawText, readBak) {
  const tryParse = (text) => {
    if (typeof text !== 'string') return null
    try {
      const parsed = JSON.parse(text)
      return Array.isArray(parsed) ? parsed : null
    } catch (_) {
      return null
    }
  }

  let arr = tryParse(rawText)
  if (!arr && typeof readBak === 'function') {
    arr = tryParse(readBak())
  }
  if (!arr) return []

  return arr.map((t) => migrateTemplateV1toV2(t))
}

// Escritura atómica simulada de templates.json usando callbacks inyectados.
// copyBak(): copia el actual a .bak (no-op si no existe).
// writeTmp(content): escribe el temporal.
// renameToFinal(): renombra temporal → final.
// Si algo lanza, propaga el error (el llamador puede restaurar del .bak).
export function saveTemplatesSafe(data, writeTmp, renameToFinal, copyBak) {
  if (typeof copyBak === 'function') copyBak()
  writeTmp(JSON.stringify(data))
  renameToFinal()
}
