import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Slider } from "@/components/ui/slider"
import {
  Upload, ZoomIn, ZoomOut, RotateCcw, Check,
  Download, Trash2, Move, CircleDashed, Eye, EyeOff, Edit, PencilIcon, ShareIcon, TrashIcon, X, Square, Minus
} from "lucide-react"
import './App.css'
import PinitIcon from './assets/PinitIcon.ico'

// ─── Exact measurements from Krita templates ──────────────────────────────
// cut_55_2026.kra  → 840×840px at 300dpi
// a4_pin_55_2026.kra → 2480×3508px at 300dpi = 210×297mm A4
const DPI = 300
const MM_TO_PX = DPI / 25.4            // 11.811 px/mm
const A4_W_MM = 210
const A4_H_MM = 297
const A4_W_PX = 2480                    // exact Krita canvas
const A4_H_PX = 3508

// Default values (now driven by state in App)
const DEFAULT_PIN_DIAM_MM = 59
const DEFAULT_BLEED_MM = 4.3

// Derived export constants — recalculated dynamically inside App
function calcExportConstants(pinDiamMm, bleedMm) {
  const pinRadiusMm = pinDiamMm / 2
  const pinRadiusPx300 = pinRadiusMm * MM_TO_PX
  const bleedPx300 = bleedMm * MM_TO_PX
  const exportRadiusPx = Math.round(pinRadiusPx300 + bleedPx300)
  return { pinRadiusMm, pinRadiusPx300, bleedPx300, exportRadiusPx }
}

// Grid defaults
const DEFAULT_COLS = 3
const DEFAULT_ROWS = 4
const DEFAULT_GAP_X_MM = 69.5
const DEFAULT_GAP_Y_MM = 69.5

function calcPinFractions(cols, rows, gapXMm, gapYMm) {
  const totalW = (cols - 1) * gapXMm
  const totalH = (rows - 1) * gapYMm
  const startX = (A4_W_MM - totalW) / 2
  const startY = (A4_H_MM - totalH) / 2
  const fracs = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      fracs.push([
        (startX + c * gapXMm) / A4_W_MM,
        (startY + r * gapYMm) / A4_H_MM,
      ])
    }
  }
  return fracs
}

// ─── Color helpers ─────────────────────────────────────────────────────────

// Muestrea el color promedio de N sectores angulares en el anillo interior del pin
// (los últimos `ringDepth` píxeles antes del borde). Devuelve array de {r,g,b}.
function sampleBorderSectors(ctx, cx, cy, innerR, ringDepth, sectors) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  const data = imageData.data
  const W = ctx.canvas.width

  const result = []
  for (let s = 0; s < sectors; s++) {
    const angleStart = (s / sectors) * Math.PI * 2
    const angleEnd = ((s + 1) / sectors) * Math.PI * 2
    let rSum = 0, gSum = 0, bSum = 0, count = 0

    // Muestreamos líneas radiales dentro de este sector
    for (let a = angleStart; a < angleEnd; a += (angleEnd - angleStart) / 8) {
      // Desde (innerR - ringDepth) hasta innerR
      for (let depth = 0; depth <= ringDepth; depth++) {
        const r = innerR - depth
        if (r < 0) continue
        const x = Math.round(cx + Math.cos(a) * r)
        const y = Math.round(cy + Math.sin(a) * r)
        if (x < 0 || x >= W || y < 0 || y >= ctx.canvas.height) continue
        const idx = (y * W + x) * 4
        if (data[idx + 3] < 30) continue  // skip transparente
        rSum += data[idx]; gSum += data[idx + 1]; bSum += data[idx + 2]
        count++
      }
    }
    result.push(count > 0
      ? { r: Math.round(rSum / count), g: Math.round(gSum / count), b: Math.round(bSum / count) }
      : null
    )
  }

  // Rellenar sectores nulos con vecinos
  return result.map((c, i) => {
    if (c) return c
    for (let d = 1; d < sectors; d++) {
      const left = result[(i - d + sectors) % sectors]
      const right = result[(i + d) % sectors]
      if (left) return left
      if (right) return right
    }
    return { r: 240, g: 240, b: 240 }
  })
}

// Pinta el anillo de sangría (de innerR a outerR) con difusión de los colores del borde
function paintBleedRing(ctx, cx, cy, innerR, outerR, sectorColors) {
  const sectors = sectorColors.length
  const W = ctx.canvas.width
  const H = ctx.canvas.height

  const yMin = Math.max(0, Math.floor(cy - outerR - 1))
  const yMax = Math.min(H - 1, Math.ceil(cy + outerR + 1))
  const xMin = Math.max(0, Math.floor(cx - outerR - 1))
  const xMax = Math.min(W - 1, Math.ceil(cx + outerR + 1))

  // Escribimos directo al ImageData para performance
  const imageData = ctx.getImageData(xMin, yMin, xMax - xMin + 1, yMax - yMin + 1)
  const data = imageData.data
  const iW = xMax - xMin + 1

  for (let py = yMin; py <= yMax; py++) {
    for (let px = xMin; px <= xMax; px++) {
      const dx = px - cx
      const dy = py - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Solo el anillo entre innerR y outerR
      if (dist < innerR || dist > outerR) continue

      // Ángulo → sector, con interpolación suave entre sectores vecinos
      const angle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2)
      const sectorF = (angle / (Math.PI * 2)) * sectors
      const s0 = Math.floor(sectorF) % sectors
      const s1 = (s0 + 1) % sectors
      const t = sectorF - Math.floor(sectorF)

      const c0 = sectorColors[s0]
      const c1 = sectorColors[s1]
      const r = Math.round(c0.r * (1 - t) + c1.r * t)
      const g = Math.round(c0.g * (1 - t) + c1.g * t)
      const b = Math.round(c0.b * (1 - t) + c1.b * t)

      // Fade de opacidad: 100% junto al pin, ~85% en el borde exterior
      const fadeT = (dist - innerR) / (outerR - innerR)  // 0=inner, 1=outer
      const alpha = Math.round(255 * (1 - fadeT * 0.15))

      const localX = px - xMin
      const localY = py - yMin
      const idx = (localY * iW + localX) * 4
      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = alpha
    }
  }
  ctx.putImageData(imageData, xMin, yMin)
}

// ─── PinCropper ────────────────────────────────────────────────────────────
function PinCropper({ imageSrc, onConfirm, onCancel, pinDiamMm, bleedMm, exportRadiusPx, innerRadiusPx }) {
  // El canvas de preview es más grande que el pin para mostrar el anillo de sangría.
  // DISPLAY_BLEED se deriva de bleedMm usando la misma proporción que en el A4:
  //   DISPLAY_SCALE_CROPPER = DISPLAY_INNER / (pinDiamMm) → px/mm en el cropper
  //   DISPLAY_BLEED = bleedMm * DISPLAY_SCALE_CROPPER
  const DISPLAY_INNER = 460   // px del pin en pantalla (diámetro completo)
  const DISPLAY_SCALE_CROPPER = DISPLAY_INNER / pinDiamMm   // px/mm en el cropper
  const DISPLAY_BLEED = Math.round(bleedMm * DISPLAY_SCALE_CROPPER)
  const DISPLAY_SIZE = DISPLAY_INNER + DISPLAY_BLEED * 2  // canvas total incluyendo anillo

  const EXPORT_SIZE = exportRadiusPx * 2

  const canvasRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imgRef = useRef(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  // Opciones
  const [fillEnabled, setFillEnabled] = useState(false)
  const [fillColor, setFillColor] = useState('#ffffff')
  const [outpaintEnabled, setOutpaintEnabled] = useState(false)

  useEffect(() => {
    if (!imageSrc) return
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      const scale = Math.max(DISPLAY_INNER / img.width, DISPLAY_INNER / img.height)
      setZoom(scale)
      setOffset({ x: 0, y: 0 })
      setImgLoaded(true)
    }
    img.src = imageSrc
  }, [imageSrc])

  useEffect(() => {
    if (imgLoaded) draw()
  }, [zoom, offset, imgLoaded, fillEnabled, fillColor, outpaintEnabled])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas || !imgRef.current) return
    const ctx = canvas.getContext('2d')
    const img = imgRef.current
    const S = DISPLAY_SIZE
    const cx = S / 2
    const cy = S / 2
    const innerR = DISPLAY_INNER / 2
    const outerR = innerR + DISPLAY_BLEED

    ctx.clearRect(0, 0, S, S)



    // 2. Relleno de color dentro del pin (si está activo)
    if (fillEnabled) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
      ctx.clip()
      ctx.fillStyle = fillColor
      ctx.fillRect(0, 0, S, S)
      ctx.restore()
    }

    // 3. Imagen dentro del pin
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
    ctx.clip()
    const w = img.width * zoom
    const h = img.height * zoom
    ctx.drawImage(img, cx - w / 2 + offset.x, cy - h / 2 + offset.y, w, h)
    ctx.restore()

    // 4. Outpaint: muestrea el borde del pin y pinta el anillo de sangría
    if (outpaintEnabled && DISPLAY_BLEED > 0) {
      const ringDepth = Math.max(4, Math.round(innerR * 0.06))
      const sectors = 128
      const borderColors = sampleBorderSectors(ctx, cx, cy, innerR, ringDepth, sectors)
      paintBleedRing(ctx, cx, cy, innerR, outerR, borderColors)
    }

    // 5. Borde dorado del pin
    ctx.beginPath()
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
    ctx.strokeStyle = '#e2c97e'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // 6. Borde exterior del anillo de sangría (gris sutil)
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
    ctx.strokeStyle = '#d4d4d4'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  const onMouseDown = (e) => {
    setDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }
  const onMouseMove = (e) => {
    if (!dragging) return
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }
  const onMouseUp = () => setDragging(false)
  const onWheel = (e) => {
    e.preventDefault()
    setZoom(z => Math.max(0.05, Math.min(10, z * (1 - e.deltaY * 0.001))))
  }

  const handleEyedropper = async () => {
    if (!window.EyeDropper) return
    try {
      const result = await new window.EyeDropper().open()
      setFillColor(result.sRGBHex)
      if (!fillEnabled) setFillEnabled(true)
    } catch (_) { }
  }

  const handleConfirm = () => {
    const outerR = exportRadiusPx
    const innerR = innerRadiusPx
    const exportScale = innerR / (DISPLAY_INNER / 2)
    const img = imgRef.current

    // ── Canvas del PIN (CORREGIDO) ──────────────────────────────────
    // Ahora el canvas mide EXACTAMENTE el diámetro del pin sin la sangría
    const pinSize = innerR * 2
    const offPin = document.createElement('canvas')
    offPin.width = pinSize
    offPin.height = pinSize
    const ctxPin = offPin.getContext('2d')

    const pcx = pinSize / 2
    const pcy = pinSize / 2

    if (fillEnabled) {
      ctxPin.save()
      ctxPin.beginPath()
      ctxPin.arc(pcx, pcy, innerR, 0, Math.PI * 2)
      ctxPin.clip()
      ctxPin.fillStyle = fillColor
      ctxPin.fillRect(0, 0, pinSize, pinSize)
      ctxPin.restore()
    }

    ctxPin.save()
    ctxPin.beginPath()
    ctxPin.arc(pcx, pcy, innerR, 0, Math.PI * 2)
    ctxPin.clip()
    
    const w = img.width * zoom * exportScale
    const h = img.height * zoom * exportScale
    
    ctxPin.drawImage(img,
      pcx - w / 2 + offset.x * exportScale,
      pcy - h / 2 + offset.y * exportScale,
      w, h
    )
    ctxPin.restore()

    // ── Canvas del ANILLO DE SANGRÍA (Queda igual) ──────────────────────
    const bleedSize = outerR * 2
    const offBleed = document.createElement('canvas')
    offBleed.width = bleedSize
    offBleed.height = bleedSize
    const ctxBleed = offBleed.getContext('2d')

    const bcx = bleedSize / 2
    const bcy = bleedSize / 2

    if (outpaintEnabled) {
      // Copiar el pin al canvas de sangría para poder muestrear el borde
      if (fillEnabled) {
        ctxBleed.save()
        ctxBleed.beginPath()
        ctxBleed.arc(bcx, bcy, innerR, 0, Math.PI * 2)
        ctxBleed.clip()
        ctxBleed.fillStyle = fillColor
        ctxBleed.fillRect(0, 0, bleedSize, bleedSize)
        ctxBleed.restore()
      }
      ctxBleed.save()
      ctxBleed.beginPath()
      ctxBleed.arc(bcx, bcy, innerR, 0, Math.PI * 2)
      ctxBleed.clip()
      ctxBleed.drawImage(img,
        bcx - w / 2 + offset.x * exportScale,
        bcy - h / 2 + offset.y * exportScale,
        w, h
      )
      ctxBleed.restore()

      const ringDepth = Math.max(8, Math.round(innerR * 0.06))
      const sectors = 256
      const borderColors = sampleBorderSectors(ctxBleed, bcx, bcy, innerR, ringDepth, sectors)
      paintBleedRing(ctxBleed, bcx, bcy, innerR, outerR, borderColors)
    } else {
      // Sin outpaint: fondo gris plano en el anillo
      ctxBleed.beginPath()
      ctxBleed.arc(bcx, bcy, outerR, 0, Math.PI * 2)
      ctxBleed.fillStyle = '#fbfafb'
      ctxBleed.fill()
    }

    // Borrar el interior para dejar solo el anillo (Aplicando además un leve overlap anti-aliasing)
    ctxBleed.save()
    ctxBleed.globalCompositeOperation = 'destination-out'
    ctxBleed.beginPath()
    ctxBleed.arc(bcx, bcy, innerR, 0, Math.PI * 2) 
    ctxBleed.fill()
    ctxBleed.restore()

    onConfirm({
      pinUrl: offPin.toDataURL('image/png'),
      bleedUrl: offBleed.toDataURL('image/png'),
    })
  }

  const handleReset = () => {
    if (!imgRef.current) return
    const scale = Math.max(DISPLAY_INNER / imgRef.current.width, DISPLAY_INNER / imgRef.current.height)
    setZoom(scale)
    setOffset({ x: 0, y: 0 })
  }

  const checkStyle = {
    display: 'flex', alignItems: 'center', gap: 7,
    fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none',
  }

  return (
    <div className="cropper-overlay">
      <div className="cropper-panel flex flex-col justify-between">
        <div className="cropper-header">
          <CircleDashed size={18} />
          <span>Recortar — ⌀{pinDiamMm}mm · anillo de sangría visible</span>
        </div>

        <div className="cropper-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={DISPLAY_SIZE}
            height={DISPLAY_SIZE}
            style={{
              cursor: dragging ? 'grabbing' : 'grab',
              borderRadius: '50%',
              display: 'block',
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onWheel={onWheel}
          />
          <div className="cropper-hint">
            <Move size={12} /> Arrastrá para mover · Scroll para zoom
          </div>
        </div>

        <div className="cropper-controls">
          <div className="zoom-row">
            <ZoomOut size={16} />
            <Slider min={5} max={2000} step={1}
              value={[Math.round(zoom * 100)]}
              onValueChange={([v]) => setZoom(v / 100)}
              className="zoom-slider"
            />
            <ZoomIn size={16} />
            <span className="zoom-label">{Math.round(zoom * 100)}%</span>
          </div>

          {/* ── Opciones ── */}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 10, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 9 }}>

            <label style={checkStyle}>
              <input type="checkbox" checked={fillEnabled}
                onChange={e => setFillEnabled(e.target.checked)}
                style={{ accentColor: 'var(--gold)', width: 14, height: 14 }}
              />
              Rellenar espacios vacíos
            </label>

            {fillEnabled && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 21 }}>
                <input type="color" value={fillColor}
                  onChange={e => setFillColor(e.target.value)}
                  style={{
                    width: 28, height: 28, border: '1px solid var(--border)',
                    borderRadius: 5, cursor: 'pointer', padding: 2,
                    background: 'var(--surface3)',
                  }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{fillColor}</span>
                {window.EyeDropper && (
                  <button onClick={handleEyedropper} title="Cuentagotas"
                    style={{
                      background: 'var(--surface3)', border: '1px solid var(--border)',
                      borderRadius: 5, padding: '3px 7px', cursor: 'pointer',
                      color: 'var(--text-muted)', fontSize: 15, lineHeight: 1,
                    }}
                  >💧</button>
                )}
              </div>
            )}

            <label style={checkStyle}>
              <input type="checkbox" checked={outpaintEnabled}
                onChange={e => setOutpaintEnabled(e.target.checked)}
                style={{ accentColor: 'var(--gold)', width: 14, height: 14 }}
              />
              Difusión de borde en sangría
            </label>

            {outpaintEnabled && (
              <p style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 21, margin: 0, lineHeight: 1.4 }}>
                El anillo exterior adoptará los colores del borde{fillEnabled ? ' y del relleno' : ' de la imagen'}.
              </p>
            )}
          </div>
        </div>

        <div className="cropper-actions">
          <Button variant="ghost" size="sm" onClick={handleReset} className="btn-ghost-gold px-4! py-2!">
            <RotateCcw size={14} /> Resetear
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel} className="btn-ghost-muted px-4! py-2!">
            Cancelar
          </Button>
          <Button size="sm" onClick={handleConfirm} className="btn-gold px-4! py-2!">
            <Check size={16} /> Confirmar
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── PinSlot ───────────────────────────────────────────────────────────────
function PinSlot({ index, imageData, bleedUrl, isSelected, menuOpen, onClick, onEdit, onRemove, onDrop, displayRadius, outerBleed }) {
  const [dragOver, setDragOver] = useState(false)
  const size = displayRadius * 2
  const bleedSize = size + outerBleed * 2

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)
  const onDrop_ = (e) => {
    e.preventDefault(); setDragOver(false)
    const idx = e.dataTransfer.getData('pin-index')
    if (idx !== '') onDrop(parseInt(idx))
  }

  return (
    <div style={{ position: 'relative', width: size, height: size }}>

      {/* 2. CÍRCULO EXTERIOR — sangría real o placeholder gris */}
      <div
        style={{
          position: 'absolute',
          top: -outerBleed,
          left: -outerBleed,
          width: bleedSize,
          height: bleedSize,
          borderRadius: '50%',
          backgroundColor: '#fbfafb',
          border: '1px solid #d4d4d4',
          zIndex: 0,
          pointerEvents: 'none',
          // Si hay imagen de sangría, la muestra encima del fondo gris
          ...(bleedUrl && {
            backgroundImage: `url(${bleedUrl})`,
            backgroundSize: '100% 100%',
            border: 'none',
          }),
        }}
      />


      {/* 3. CÍRCULO INTERIOR (EL QUE REACCIONA) */}
      {/* ACÁ sí va la clase "pin-slot". Este es el único que se va a agrandar */}
      <div
        className={`pin-slot ${isSelected ? 'selected' : ''} ${dragOver ? 'drag-over' : ''} ${imageData ? 'has-image' : ''}`}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          position: 'relative',
          zIndex: 1
        }}
        onClick={onClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop_}
      >
        {imageData ? (
          <img
            src={imageData}
            alt={`Pin ${index + 1}`}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('pin-index', index)}
          />
        ) : (
          <div className="pin-empty-label">{index + 1}</div>
        )}
      </div>

    </div>
  )
}

// ─── Celds SVG overlay ─────────────────────────────────────────────────────
function CeldsOverlay({ positions, radius, w, h }) {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}
      width={w} height={h}
    >
      {positions.map((pos, i) => (
        <g key={i}>
          <circle cx={pos.x} cy={pos.y} r={radius}
            fill="none" stroke="#1e88e5" strokeWidth="1"
            strokeDasharray="4 3" opacity="0.75"
          />
          <line x1={pos.x - 7} y1={pos.y} x2={pos.x + 7} y2={pos.y}
            stroke="#1e88e5" strokeWidth="0.8" opacity="0.75" />
          <line x1={pos.x} y1={pos.y - 7} x2={pos.x} y2={pos.y + 7}
            stroke="#1e88e5" strokeWidth="0.8" opacity="0.75" />
        </g>
      ))}
    </svg>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [pins, setPins] = useState(Array(DEFAULT_COLS * DEFAULT_ROWS).fill(null))
  const [originals, setOriginals] = useState(Array(DEFAULT_COLS * DEFAULT_ROWS).fill(null))
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [cropTarget, setCropTarget] = useState(null)
  const [menuSlotIndex, setMenuSlotIndex] = useState(null)
  const fileInputRef = useRef(null)

  // ── Medidas configurables ──────────────────────────────────────────────
  const [pinDiamMm, setPinDiamMm] = useState(DEFAULT_PIN_DIAM_MM)
  const [bleedMm, setBleedMm] = useState(DEFAULT_BLEED_MM)
  const [pinDiamInput, setPinDiamInput] = useState(String(DEFAULT_PIN_DIAM_MM))
  const [bleedInput, setBleedInput] = useState(String(DEFAULT_BLEED_MM))
  const [bleedImages, setBleedImages] = useState(Array(DEFAULT_COLS * DEFAULT_ROWS).fill(null))

  // ── Grilla configurable ────────────────────────────────────────────────
  const [gridCols, setGridCols] = useState(DEFAULT_COLS)
  const [gridRows, setGridRows] = useState(DEFAULT_ROWS)
  const [gapXMm, setGapXMm] = useState(DEFAULT_GAP_X_MM)
  const [gapYMm, setGapYMm] = useState(DEFAULT_GAP_Y_MM)
  const [colsInput, setColsInput] = useState(String(DEFAULT_COLS))
  const [rowsInput, setRowsInput] = useState(String(DEFAULT_ROWS))
  const [gapXInput, setGapXInput] = useState(String(DEFAULT_GAP_X_MM))
  const [gapYInput, setGapYInput] = useState(String(DEFAULT_GAP_Y_MM))

  const PIN_FRACTIONS = calcPinFractions(gridCols, gridRows, gapXMm, gapYMm)
  const TOTAL_PINS = gridCols * gridRows

  const { pinRadiusMm: PIN_RADIUS_MM, pinRadiusPx300: PIN_RADIUS_PX_300, exportRadiusPx: EXPORT_RADIUS_PX } = calcExportConstants(pinDiamMm, bleedMm)

  const handlePinDiamChange = (val) => {
    setPinDiamInput(val)
    const n = parseFloat(val)
    if (!isNaN(n) && n >= 10 && n <= 120) setPinDiamMm(n)
  }

  const handleBleedChange = (val) => {
    setBleedInput(val)
    const n = parseFloat(val)
    if (!isNaN(n) && n >= 0 && n <= 20) setBleedMm(n)
  }

  const handleColsChange = (val) => {
    setColsInput(val)
    const n = parseInt(val)
    if (!isNaN(n) && n >= 1 && n <= 6) {
      setGridCols(n)
      setPins(prev => Array(n * gridRows).fill(null).map((_, i) => prev[i] ?? null))
      setOriginals(prev => Array(n * gridRows).fill(null).map((_, i) => prev[i] ?? null))
    }
  }

  const handleRowsChange = (val) => {
    setRowsInput(val)
    const n = parseInt(val)
    if (!isNaN(n) && n >= 1 && n <= 8) {
      setGridRows(n)
      setPins(prev => Array(gridCols * n).fill(null).map((_, i) => prev[i] ?? null))
      setOriginals(prev => Array(gridCols * n).fill(null).map((_, i) => prev[i] ?? null))
    }
  }

  const handleGapXChange = (val) => {
    setGapXInput(val)
    const n = parseFloat(val)
    if (!isNaN(n) && n >= 10 && n <= 200) setGapXMm(n)
  }

  const handleGapYChange = (val) => {
    setGapYInput(val)
    const n = parseFloat(val)
    if (!isNaN(n) && n >= 10 && n <= 200) setGapYMm(n)
  }

  // A4 display: zoom visual (solo afecta la pantalla, no el export)
  const [a4Zoom, setA4Zoom] = useState(1.0)
  const A4_BASE_W = 500
  const A4_DISPLAY_W = Math.round(A4_BASE_W * a4Zoom)
  const A4_DISPLAY_H = Math.round(A4_DISPLAY_W * (A4_H_MM / A4_W_MM))
  const DISPLAY_SCALE = A4_DISPLAY_W / A4_W_MM      // px/mm on screen
  const PIN_DISPLAY_RADIUS = Math.round(PIN_RADIUS_MM * DISPLAY_SCALE)

  const BLEED_PX = Math.round(bleedMm * DISPLAY_SCALE)

  const pinDisplayPositions = PIN_FRACTIONS.map(([fx, fy]) => ({
    x: Math.round(fx * A4_DISPLAY_W),
    y: Math.round(fy * A4_DISPLAY_H),
  }))

  const handleSlotClick = (idx) => {
    if (pins[idx]) {
      setSelectedSlot(idx === selectedSlot ? null : idx)
      console.log(idx)
    } else {
      setSelectedSlot(idx)
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const handleEditSlot = () => {
    if (selectedSlot === null) return

    // Usar la imagen original sin recortar; si no hay (slot viejo), caer al recortado
    const src = originals[selectedSlot] || pins[selectedSlot]
    setCropTarget({
      imageSrc: src,
      slotIndex: selectedSlot
    })
  }

  const handleRemoveSlot = (idx) => {
    setPins(prev => { const n = [...prev]; n[idx] = null; return n })
    setOriginals(prev => { const n = [...prev]; n[idx] = null; return n })
    setBleedImages(prev => { const n = [...prev]; n[idx] = null; return n })
    if (selectedSlot === idx) setSelectedSlot(null)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const imageSrc = URL.createObjectURL(file)

    // Guardar original para poder re-editar desde cero
    setOriginals(prev => { const n = [...prev]; n[selectedSlot] = imageSrc; return n })

    setCropTarget({
      imageSrc,
      slotIndex: selectedSlot
    })
  }

  const handleCropConfirm = ({ pinUrl, bleedUrl }) => {
    setPins(prev => { const n = [...prev]; n[cropTarget.slotIndex] = pinUrl; return n })
    setBleedImages(prev => { const n = [...prev]; n[cropTarget.slotIndex] = bleedUrl; return n })
    setSelectedSlot(null)
    setCropTarget(null)
  }


  const handleSlotDrop = (targetIdx, sourceIdx) => {
    if (sourceIdx === targetIdx) return
    setPins(prev => {
      const n = [...prev]
        ;[n[targetIdx], n[sourceIdx]] = [n[sourceIdx], n[targetIdx]]
      return n
    })
    setOriginals(prev => {
      const n = [...prev]
        ;[n[targetIdx], n[sourceIdx]] = [n[sourceIdx], n[targetIdx]]
      return n
    })
  }

  const handleRemove = (idx) => {
    setPins(prev => { const n = [...prev]; n[idx] = null; return n })
    setOriginals(prev => { const n = [...prev]; n[idx] = null; return n })
    if (selectedSlot === idx) setSelectedSlot(null)
  }

  const handleExportPNG = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = A4_W_PX
    canvas.height = A4_H_PX
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, A4_W_PX, A4_H_PX)

    await Promise.all(
      PIN_FRACTIONS.map(([fx, fy], idx) => new Promise(resolve => {
        if (!pins[idx]) { resolve(); return }

        const cx = Math.round(fx * A4_W_PX)
        const cy = Math.round(fy * A4_H_PX)
        const r = Math.round(PIN_RADIUS_PX_300)
        const outerR = EXPORT_RADIUS_PX

        const drawPin = (bleedDone) => {
          const pinImg = new Image()
          pinImg.onload = () => {
            // 2. Pin encima (recortado a su radio real)
            ctx.save()
            ctx.beginPath()
            ctx.arc(cx, cy, r, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(pinImg, cx - r, cy - r, r * 2, r * 2)
            ctx.restore()
            resolve()
          }
          pinImg.src = pins[idx]
        }

        if (bleedImages[idx]) {
          // 1a. Sangría real generada en el cropper
          const bleedImg = new Image()
          bleedImg.onload = () => {
            ctx.drawImage(bleedImg, cx - outerR, cy - outerR, outerR * 2, outerR * 2)
            drawPin(true)
          }
          bleedImg.src = bleedImages[idx]
        } else {
          // 1b. Fallback: círculo gris plano
          ctx.beginPath()
          ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
          ctx.fillStyle = '#fbfafb'
          ctx.fill()
          drawPin(false)
        }
      }))
    )

    const link = document.createElement('a')
    link.download = `pines_a4_300dpi_${Date.now().toString()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const filledCount = pins.filter(Boolean).length

  const inputStyle = {
    width: 72,
    background: 'var(--surface3)',
    border: '1px solid var(--border)',
    borderRadius: 5,
    color: 'var(--text)',
    padding: '3px 6px',
    fontSize: 13,
    textAlign: 'right',
    outline: 'none',
    transition: 'border-color 0.15s',
  }
  const unitStyle = {
    fontSize: 11,
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
  }

  //UPDATES
  const [updateState, setUpdateState] = useState(null)
  // null | 'available' | 'downloading' | 'ready'
  const [updateVersion, setUpdateVersion] = useState('')
  const [updateProgress, setUpdateProgress] = useState(0)

  useEffect(() => {
    window.ipcRenderer.on('update-available', (_, version) => {
      setUpdateVersion(version)
      setUpdateState('available')
    })
    window.ipcRenderer.on('update-progress', (_, percent) => {
      setUpdateState('downloading')
      setUpdateProgress(percent)
    })
    window.ipcRenderer.on('update-downloaded', () => {
      setUpdateState('ready')
      setUpdateProgress(100)
    })
  }, [])


  return (
    <div className="app-root flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* ── Especificaciones (solo texto, esquina inferior derecha) ── */}
      <div className="absolute bottom-30 right-21">
        <div className="section-label">ESPECIFICACIONES</div>
        <div className="spec-row"><span>Hoja</span><span>A4 {A4_W_MM}×{A4_H_MM}mm</span></div>
        <div className="spec-row"><span>Resolución</span><span>300 DPI</span></div>
        <div className="spec-row"><span>Pin ⌀</span><span>{pinDiamMm}mm</span></div>
        <div className="spec-row"><span>Sangría</span><span>{bleedMm}mm</span></div>
        <div className="spec-row"><span>Grilla</span><span>{gridCols}×{gridRows} ({TOTAL_PINS} pines)</span></div>
        <div className="spec-row"><span>Output</span><span>2480×3508px</span></div>
      </div>

      <header className="tittle-bar flex justify-between items-center z-1 border-b-2 p-1">
        <div className="flex items-center gap-2">
          <img src={PinitIcon} className="h-10 w-10 object-contain pl-1!" alt="" />
          <span className="app-title">PINIT</span>
        </div>
        <ButtonGroup className="windows-button bg-scroll z-90 ">
          <Button variant="outline" className="px-2! py-2!" onClick={() => window.ipcRenderer.minimize()}><Minus /></Button>
          <Button variant="outline" className="px-2! py-2!" onClick={() => window.ipcRenderer.toggleMaximize()}><Square /></Button>
          <Button variant="outline" className="px-2! py-2!" onClick={() => window.ipcRenderer.close()}><X className="text-red-600" /></Button>
        </ButtonGroup>
      </header>

      <span className="kev absolute bottom-1 left-1">made by kev</span>

      <div className="flex w-screen flex-1">

        {/* ── Sidebar izquierdo ── */}
        <aside style={{
          width: 190,
          minWidth: 190,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          padding: '14px 12px',
          overflowY: 'auto',
        }}>
          <div className="section-label" style={{ marginBottom: 10 }}>CONFIGURACIÓN</div>

          {/* Pin ⌀ */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.06em' }}>DIÁMETRO PIN</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number" min={10} max={120} step={0.5}
                value={pinDiamInput}
                onChange={e => handlePinDiamChange(e.target.value)}
                style={inputStyle}
              />
              <span style={unitStyle}>mm</span>
            </div>
          </div>

          {/* Sangría */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.06em' }}>SANGRÍA</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number" min={0} max={20} step={0.1}
                value={bleedInput}
                onChange={e => handleBleedChange(e.target.value)}
                style={inputStyle}
              />
              <span style={unitStyle}>mm</span>
            </div>
          </div>

          {/* Zoom A4 visual */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.06em' }}>ZOOM A4 (VISUAL)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="range" min={0.5} max={2.5} step={0.05}
                value={a4Zoom}
                onChange={e => setA4Zoom(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--gold)' }}
              />
              <span style={{ ...unitStyle, minWidth: 34, textAlign: 'right' }}>{Math.round(a4Zoom * 100)}%</span>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 14px' }} />

          {/* Columnas */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.06em' }}>COLUMNAS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number" min={1} max={6} step={1}
                value={colsInput}
                onChange={e => handleColsChange(e.target.value)}
                style={inputStyle}
              />
              <span style={unitStyle}>cols</span>
            </div>
          </div>

          {/* Filas */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.06em' }}>FILAS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number" min={1} max={8} step={1}
                value={rowsInput}
                onChange={e => handleRowsChange(e.target.value)}
                style={inputStyle}
              />
              <span style={unitStyle}>filas</span>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 14px' }} />

          {/* Espaciado X */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.06em' }}>HORIZONTAL ↔</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number" min={10} max={200} step={0.5}
                value={gapXInput}
                onChange={e => handleGapXChange(e.target.value)}
                style={inputStyle}
              />
              <span style={unitStyle}>mm</span>
            </div>
          </div>

          {/* Espaciado Y */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.06em' }}>VERTICAL ↕</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number" min={10} max={200} step={0.5}
                value={gapYInput}
                onChange={e => handleGapYChange(e.target.value)}
                style={inputStyle}
              />
              <span style={unitStyle}>mm</span>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 14px' }} />

          {/* Total de pines */}
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 4 }}>TOTAL PINES</div>
          <div style={{ fontSize: 22, fontFamily: 'Bebas Neue', color: 'var(--gold)', letterSpacing: '0.05em' }}>
            {TOTAL_PINS}
          </div>
        </aside>

        {/* ── Contenido principal ── */}
        <div className="flex-1">
          <main className="main-area">
            <div className="w-1/3">
              <div className="section-label">PROGRESO</div>
              <div className="progress-bar-wrap">
                <div className="progress-bar" style={{ width: `${(filledCount / TOTAL_PINS) * 100}%` }} />
              </div>
              <div className="progress-label">{filledCount} / {TOTAL_PINS} pines</div>
              <p className="upload-hint">
                {selectedSlot !== null
                  ? `→ Cargando en slot ${selectedSlot + 1}`
                  : 'Click en slot vacío o cargá directo'}
              </p>
            </div>
            <div className="a4-wrapper">
              <div
                className="a4-sheet z-0"
                style={{ width: A4_DISPLAY_W, height: A4_DISPLAY_H, position: 'relative' }}
              >
                {pinDisplayPositions.map((pos, idx) => (
                  <div key={idx} style={{
                    position: 'absolute',
                    left: pos.x - PIN_DISPLAY_RADIUS,
                    top: pos.y - PIN_DISPLAY_RADIUS,
                  }}>
                    <PinSlot
                      index={idx}
                      imageData={pins[idx]}
                      isSelected={selectedSlot === idx}
                      menuOpen={menuSlotIndex === idx}
                      onClick={() => handleSlotClick(idx)}
                      onEdit={() => handleEditSlot(idx)}
                      onRemove={() => handleRemoveSlot(idx)}
                      onDrop={(src) => handleSlotDrop(idx, src)}
                      displayRadius={PIN_DISPLAY_RADIUS}
                      outerBleed={bleedMm * DISPLAY_SCALE}
                      bleedUrl={bleedImages[idx]}
                    />



                    {selectedSlot === idx && pins[idx] && (
                      <ButtonGroup className="absolute z-100 " style={{
                        bottom: '100%',     /* Lo posiciona arriba del pin */
                        left: '50%',        /* Lo centra a la mitad del pin */
                        transform: 'translateX(-50%)', /* Ajusta el centro exacto */
                        marginBottom: '5px' /* Espacio entre el menú y el pin */
                      }}>
                        <Button variant="secondary" size="lg" className="px-2! py-2!" onClick={handleEditSlot}><Edit /> Editar</Button>
                        <Button variant="secondary" size="lg" className="px-3! py-2!" onClick={() => handleRemoveSlot(selectedSlot)}><TrashIcon className="text-red-600" /></Button>
                      </ButtonGroup>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="canvas-footer">
              Arrastrá pines para reordenarlos · Click en slot vacío para cargar imagen
            </div>
          </main>
        </div>
      </div>
      <div className="flex w-1/8 flex-col absolute right-6 bottom-6">
        <Button className="btn-gold w-full" onClick={handleExportPNG} disabled={filledCount === 0}>
          <Download size={15} /> Exportar PNG 300dpi
        </Button>
        <Button variant="ghost" className="btn-ghost-muted w-full mt-2"
          onClick={() => { if (confirm('¿Limpiar todos los slots?')) { setPins(Array(TOTAL_PINS).fill(null)); setOriginals(Array(TOTAL_PINS).fill(null)) } }}
          disabled={filledCount === 0}
        >
          <Trash2 size={14} /> Limpiar todo
        </Button>
      </div>

      {cropTarget && (
        <PinCropper
          imageSrc={cropTarget.imageSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => {
            setCropTarget(null)
            setSelectedSlot(null)
          }}
          pinDiamMm={pinDiamMm}
          bleedMm={bleedMm}
          exportRadiusPx={EXPORT_RADIUS_PX}
          innerRadiusPx={Math.round(PIN_RADIUS_PX_300)}
        />
      )}


      {updateState && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999,
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--gold)',
            borderRadius: 14,
            padding: '28px 32px',
            minWidth: 360,
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--gold)', letterSpacing: '0.08em' }}>
              {updateState === 'available' && '✨ Nueva versión disponible'}
              {updateState === 'downloading' && '⬇️ Descargando actualización...'}
              {updateState === 'ready' && '✅ Lista para instalar'}
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {updateState === 'available' && `Versión ${updateVersion} disponible. ¿Querés descargarla ahora?`}
              {updateState === 'downloading' && 'Podés seguir usando la app mientras se descarga.'}
              {updateState === 'ready' && 'La app se va a reiniciar para aplicar la actualización.'}
            </div>

            {(updateState === 'downloading' || updateState === 'ready') && (
              <div>
                <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: 'var(--gold)',
                    width: `${updateProgress}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                  {updateProgress}%
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {updateState === 'available' && (
                <>
                  <Button className="btn-ghost-muted px-2! py-3!" size="sm" onClick={() => setUpdateState(null)}>
                    Ahora no
                  </Button>
                  <Button className="btn-gold px-2! py-3!" size="sm" onClick={() => {
                    window.ipcRenderer.send('update:start-download')
                    setUpdateState('downloading')
                  }}>
                    Descargar
                  </Button>
                </>
              )}
              {updateState === 'downloading' && (
                <Button className="btn-ghost-muted" size="sm" disabled>
                  Descargando...
                </Button>
              )}
              {updateState === 'ready' && (
                <>
                  <Button className="btn-ghost-muted px-2! py-3!" size="sm" onClick={() => setUpdateState(null)}>
                    Más tarde
                  </Button>
                  <Button className="btn-gold px-2! py-3!" size="sm" onClick={() => {
                    window.ipcRenderer.send('update:install')
                  }}>
                    Reiniciar e instalar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}