import { describe, it, expect } from 'vitest'
import {
  calcPinFractions,
  calcPinFractionsFor,
  calcCapacity,
  AR_DIAMETER_PRESETS,
  AR_BLEED_PRESETS,
  SHEETS,
  A4_W_MM,
  A4_H_MM,
  A3_W_MM,
  A3_H_MM,
} from '../../lib/canvasHelpers.js'

describe('canvasHelpers: grilla A4 (compatibilidad hacia atrás / Gate V0)', () => {
  it('calcPinFractions(3,4,69.5,69.5) mantiene la fórmula A4 actual', () => {
    const f = calcPinFractions(3, 4, 69.5, 69.5)
    expect(f.length).toBe(12)

    // startX = (210 - 139)/2 = 35.5 ; startY = (297 - 208.5)/2 = 44.25
    const startX = (A4_W_MM - 2 * 69.5) / 2
    const startY = (A4_H_MM - 3 * 69.5) / 2
    // Primer elemento [c=0,r=0].
    expect(f[0][0]).toBeCloseTo(startX / A4_W_MM, 10)
    expect(f[0][1]).toBeCloseTo(startY / A4_H_MM, 10)
    // Último elemento [c=2,r=3].
    const last = f[f.length - 1]
    expect(last[0]).toBeCloseTo((startX + 2 * 69.5) / A4_W_MM, 10)
    expect(last[1]).toBeCloseTo((startY + 3 * 69.5) / A4_H_MM, 10)
  })

  it('default (sin sheet) === "A4" explícito', () => {
    const def = calcPinFractions(3, 4, 69.5, 69.5)
    const a4 = calcPinFractions(3, 4, 69.5, 69.5, 'A4')
    expect(def).toEqual(a4)
  })
})

describe('canvasHelpers: parametrización por hoja', () => {
  it('calcPinFractionsFor("A3",3,4,69.5,69.5) difiere de A4 y tiene longitud 12', () => {
    const a4 = calcPinFractions(3, 4, 69.5, 69.5, 'A4')
    const a3 = calcPinFractionsFor('A3', 3, 4, 69.5, 69.5)
    expect(a3.length).toBe(12)
    expect(a3).not.toEqual(a4)
    // Centrado en hoja más grande → primeros pines más alejados del borde relativo.
    expect(a3[0][0]).toBeGreaterThan(a4[0][0])
    expect(a3[0][1]).toBeGreaterThan(a4[0][1])
  })

  it('acepta objeto {w,h} como hoja', () => {
    const custom = calcPinFractions(2, 2, 80, 80, { w: 500, h: 700 })
    expect(custom.length).toBe(4)
    expect(custom[0][0]).toBeCloseTo(((500 - 80) / 2) / 500, 10)
  })

  it('SHEETS expone A4 y A3 con las medidas correctas', () => {
    expect(SHEETS.A4).toEqual({ w: A4_W_MM, h: A4_H_MM })
    expect(SHEETS.A3).toEqual({ w: A3_W_MM, h: A3_H_MM })
  })
})

describe('canvasHelpers: calcCapacity (contador en vivo)', () => {
  it('replica las tablas del informe AR', () => {
    expect(calcCapacity(58, 6, 'A4').total).toBe(8)
    expect(calcCapacity(25, 3, 'A4').total).toBe(54)
    expect(calcCapacity(58, 6, 'A3').total).toBe(20)
  })

  it('devuelve cols, rows, total y tile', () => {
    const r = calcCapacity(58, 6, 'A4')
    expect(r.tile).toBe(70)
    expect(r.cols * r.rows).toBe(r.total)
  })
})

describe('canvasHelpers: presets AR', () => {
  it('AR_DIAMETER_PRESETS tiene 6 entradas y AR_BLEED_PRESETS 2', () => {
    expect(AR_DIAMETER_PRESETS).toHaveLength(6)
    expect(AR_BLEED_PRESETS).toHaveLength(2)
    // El preset grande está marcado.
    expect(AR_DIAMETER_PRESETS.find((p) => p.large).mm).toBe(56)
  })
})
