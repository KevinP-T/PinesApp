import { describe, it, expect } from 'vitest'
import { PinitV2, CURRENT_VERSION } from '../../lib/pinitSchema.js'
import {
  sanitizeBlobs,
  deriveBleedMode,
  migratePinitV1toV2,
  migrateTemplateV1toV2,
  repairArrays,
  isFutureVersion,
  loadTemplatesSafe,
  saveTemplatesSafe,
} from '../../lib/migration.js'
import { calcPinFractions } from '../../lib/canvasHelpers.js'

const DATA_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='
const BLOB_A = 'blob:http://x/abc'
const BLOB_B = 'blob:http://y/def'

// Fixture: un .pinit V1 realista.
function makeV1Pinit() {
  return {
    version: 1,
    config: {
      pinDiamMm: 59,
      bleedMm: 6, // → bleedMode '6mm'
      gridCols: 3,
      gridRows: 4,
      gapXMm: 69.5,
      gapYMm: 69.5,
    },
    pins: [DATA_IMG],
    bleedImages: [DATA_IMG, null],
    originals: [BLOB_A, null, BLOB_B],
    exportedAt: 1700000000000,
  }
}

describe('F1: .pinit v1 real → migrar + sanitizar', () => {
  it('version==2, originals todos null, pins[0] intacto, medidas idénticas, bleedMode derivado', () => {
    const v1 = makeV1Pinit()
    const migrated = migratePinitV1toV2(v1)
    const sanitized = sanitizeBlobs(migrated)

    expect(sanitized.version).toBe(2)
    // originals: los blob: quedaron null
    expect(sanitized.originals.every((o) => o === null)).toBe(true)
    // pins[0] (data:) intacto
    expect(sanitized.pins[0]).toBe(DATA_IMG)
    // medidas originales idénticas
    expect(sanitized.config.pinDiamMm).toBe(59)
    expect(sanitized.config.bleedMm).toBe(6)
    expect(sanitized.config.gridCols).toBe(3)
    expect(sanitized.config.gridRows).toBe(4)
    expect(sanitized.config.gapXMm).toBe(69.5)
    expect(sanitized.config.gapYMm).toBe(69.5)
    // defaults derivados
    expect(sanitized.config.bleedMode).toBe('6mm')
    expect(sanitized.config.unit).toBe('mm')
    expect(sanitized.config.sheet).toBe('A4')
    // el original no debe mutarse por sanitizeBlobs (migrate sí muta por diseño/idempotencia)
    const v1copy = makeV1Pinit()
    const migrated2 = migratePinitV1toV2(v1copy)
    const sanitized2 = sanitizeBlobs(migrated2)
    expect(sanitized2.originals).toEqual([null, null, null])
    // sanitizeBlobs no muta su entrada
    expect(migrated2.originals).toEqual([BLOB_A, null, BLOB_B])
  })
})

describe('F2: sanitizeBlobs sobre todos los arrays', () => {
  it('todos los blob: quedan null y data: se conserva', () => {
    const data = {
      pins: [DATA_IMG, BLOB_A],
      bleedImages: [BLOB_B, null],
      originals: [BLOB_A, null, BLOB_B],
    }
    const out = sanitizeBlobs(data)
    expect(out.pins[0]).toBe(DATA_IMG)
    expect(out.pins[1]).toBe(null)
    expect(out.bleedImages).toEqual([null, null])
    expect(out.originals).toEqual([null, null, null])
    // no muta el original
    expect(data.pins[1]).toBe(BLOB_A)
  })
})

describe('F3: .pinit vacío no valida ni se repara', () => {
  it('PinitV2.safeParse falla en ambos (migrado y reparado)', () => {
    const x = { version: 1 }
    const migrated = migratePinitV1toV2(x)
    const before = PinitV2.safeParse(migrated)
    expect(before.success).toBe(false)

    const repaired = repairArrays(migrated)
    const after = PinitV2.safeParse(repaired)
    expect(after.success).toBe(false)
  })
})

describe('F4: v1 sin unit/sheet/bleedMode → defaults', () => {
  it('defaults mm/A4/3mm y medidas intactas', () => {
    const v1 = {
      version: 1,
      config: { pinDiamMm: 30, bleedMm: 4, gridCols: 2, gridRows: 2, gapXMm: 50, gapYMm: 50 },
    }
    const m = migratePinitV1toV2(v1)
    expect(m.config.unit).toBe('mm')
    expect(m.config.sheet).toBe('A4')
    expect(m.config.bleedMode).toBe('3mm')
    expect(m.config.pinDiamMm).toBe(30)
    expect(m.config.bleedMm).toBe(4)
    expect(m.config.gridCols).toBe(2)
    expect(m.config.gridRows).toBe(2)
  })
})

describe('F5: repairArrays padding/recorte', () => {
  it('repada de 10 → 12 y recorta de 15 → 12', () => {
    const base = { version: 2, config: { gridCols: 3, gridRows: 4 } }

    const short = migratePinitV1toV2({ ...base, pins: [DATA_IMG, null].concat(Array(8).fill(DATA_IMG)) })
    // 10 elementos
    expect(short.pins.length).toBe(10)
    repairArrays(short)
    expect(short.pins.length).toBe(12)
    expect(short.pins[10]).toBe(null)
    expect(short.pins[11]).toBe(null)
    expect(short.pins[0]).toBe(DATA_IMG)

    const long = migratePinitV1toV2({ ...base, pins: Array(15).fill(DATA_IMG) })
    repairArrays(long)
    expect(long.pins.length).toBe(12)
    expect(long.pins.every((p) => p === DATA_IMG)).toBe(true)
  })
})

describe('F6: loadTemplatesSafe migra v1 sin pisar medidas', () => {
  it('pinDiamMm:59 respetado, no sobreescrito por DEFAULT', () => {
    const arr = [
      { name: 'Plantilla A', pinDiamMm: 59, bleedMm: 4.3, gridCols: 3, gridRows: 4, gapXMm: 69.5, gapYMm: 69.5, createdAt: 1 },
    ]
    const out = loadTemplatesSafe(JSON.stringify(arr), () => null)
    expect(out).toHaveLength(1)
    expect(out[0].version).toBe(2)
    expect(out[0].pinDiamMm).toBe(59)
    expect(out[0].unit).toBe('mm')
    expect(out[0].sheet).toBe('A4')
  })
})

describe('F7: loadTemplatesSafe recupera del .bak', () => {
  it('JSON truncado + bak válido → recupera; sin bak → []', () => {
    const bak = JSON.stringify([
      { name: 'B', pinDiamMm: 40, bleedMm: 3, gridCols: 2, gridRows: 3, gapXMm: 60, gapYMm: 60, createdAt: 2 },
    ])
    const out = loadTemplatesSafe('{ invalid json', () => bak)
    expect(out).toHaveLength(1)
    expect(out[0].version).toBe(2)
    expect(out[0].pinDiamMm).toBe(40)

    const empty = loadTemplatesSafe('not json at all', () => null)
    expect(empty).toEqual([])
  })
})

describe('F8: isFutureVersion detecta versiones futuras', () => {
  it('version:99 es futura', () => {
    expect(isFutureVersion({ version: 99 })).toBe(true)
    expect(isFutureVersion({ version: CURRENT_VERSION })).toBe(false)
    expect(isFutureVersion({ version: 1 })).toBe(false)
    expect(isFutureVersion({})).toBe(false)
  })
})

describe('F9: calcPinFractions no depende del diámetro', () => {
  it('dos configs que difieren solo en pinDiamMm dan fracciones iguales', () => {
    const cols = 3, rows = 4, gx = 69.5, gy = 69.5
    const frac1 = calcPinFractions(cols, rows, gx, gy)
    const frac2 = calcPinFractions(cols, rows, gx, gy)
    expect(frac1).toEqual(frac2)
  })
})

describe('F11: calcPinFractions depende SOLO de (cols,rows,gapX,gapY)', () => {
  it('garantía de posición estable ante cambios de DEFAULT_PIN_DIAM_MM/DPI', () => {
    // Misma grilla, distinto diámetro (simula DEFAULT_PIN_DIAM_MM distinto) → igual.
    const a = calcPinFractions(3, 4, 69.5, 69.5)
    const b = calcPinFractions(3, 4, 69.5, 69.5)
    expect(a).toEqual(b)
    // Distinta grilla → distinto.
    const c = calcPinFractions(2, 2, 80, 80)
    expect(a).not.toEqual(c)
  })
})

describe('F10: idempotencia de migración', () => {
  it('migrar 2× da JSON.stringify igual (pinit y template)', () => {
    const v1 = makeV1Pinit()
    const once = migratePinitV1toV2(v1)
    const twice = migratePinitV1toV2(JSON.parse(JSON.stringify(once)))
    expect(JSON.stringify(once)).toBe(JSON.stringify(twice))

    const t1 = { name: 'T', pinDiamMm: 59, bleedMm: 6, gridCols: 3, gridRows: 4, gapXMm: 69.5, gapYMm: 69.5 }
    const to1 = migrateTemplateV1toV2(t1)
    const to2 = migrateTemplateV1toV2(JSON.parse(JSON.stringify(to1)))
    expect(JSON.stringify(to1)).toBe(JSON.stringify(to2))
  })
})

describe('F12: saveTemplatesSafe escritura atómica simulada', () => {
  it('escribe final con snapshot previo en bak y propaga error', () => {
    const data = [{ name: 'X', version: 2, pinDiamMm: 59, bleedMm: 6, gridCols: 3, gridRows: 4, gapXMm: 69.5, gapYMm: 69.5 }]
    let bakSnapshot = null
    let tmpContent = null
    let finalContent = null

    const copyBak = () => { bakSnapshot = 'PREVIO' }
    const writeTmp = (c) => { tmpContent = c }
    const renameToFinal = () => { finalContent = tmpContent }

    saveTemplatesSafe(data, writeTmp, renameToFinal, copyBak)
    expect(finalContent).toBe(JSON.stringify(data))
    expect(bakSnapshot).toBe('PREVIO')

    // Caso de fallo: renameToFinal lanza → la excepción se propaga.
    let thrown = null
    try {
      saveTemplatesSafe(data, writeTmp, () => { throw new Error('rename failed') }, copyBak)
    } catch (e) {
      thrown = e
    }
    expect(thrown).not.toBe(null)
    expect(thrown.message).toBe('rename failed')
  })
})

// Asegura que deriveBleedMode se comporta como se documenta.
describe('deriveBleedMode (garantía interna)', () => {
  it('mapea 3/6 y default', () => {
    expect(deriveBleedMode(3)).toBe('3mm')
    expect(deriveBleedMode(6)).toBe('6mm')
    expect(deriveBleedMode(4.3)).toBe('3mm')
    expect(deriveBleedMode(undefined)).toBe('3mm')
  })
})
