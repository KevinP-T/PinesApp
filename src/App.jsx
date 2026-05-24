import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Slider } from "@/components/ui/slider"
import {
  Upload, ZoomIn, ZoomOut, RotateCcw, Check,
  Download, Trash2, Move, CircleDashed, Edit, TrashIcon, X, Square, Minus,
  Lock, Unlock, Save, FolderOpen, Plus, ChevronDown, Clipboard, Link2, Unlink2,
  Copy, ClipboardPaste
} from "lucide-react"
import './App.css'
import PinitIcon from './assets/PinitIcon.ico'

// ─── Exact measurements from Krita templates ──────────────────────────────
const DPI = 300
const MM_TO_PX = DPI / 25.4
const A4_W_MM = 210
const A4_H_MM = 297
const A4_W_PX = 2480
const A4_H_PX = 3508

const DEFAULT_PIN_DIAM_MM = 59
const DEFAULT_BLEED_MM = 4.3

function calcExportConstants(pinDiamMm, bleedMm) {
  const pinRadiusMm = pinDiamMm / 2
  const pinRadiusPx300 = pinRadiusMm * MM_TO_PX
  const bleedPx300 = bleedMm * MM_TO_PX
  const exportRadiusPx = Math.round(pinRadiusPx300 + bleedPx300)
  return { pinRadiusMm, pinRadiusPx300, bleedPx300, exportRadiusPx }
}

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
function sampleBorderSectors(ctx, cx, cy, innerR, ringDepth, sectors) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  const data = imageData.data
  const W = ctx.canvas.width
  const result = []
  for (let s = 0; s < sectors; s++) {
    const angleStart = (s / sectors) * Math.PI * 2
    const angleEnd = ((s + 1) / sectors) * Math.PI * 2
    let rSum = 0, gSum = 0, bSum = 0, count = 0
    for (let a = angleStart; a < angleEnd; a += (angleEnd - angleStart) / 8) {
      for (let depth = 0; depth <= ringDepth; depth++) {
        const r = innerR - depth
        if (r < 0) continue
        const x = Math.round(cx + Math.cos(a) * r)
        const y = Math.round(cy + Math.sin(a) * r)
        if (x < 0 || x >= W || y < 0 || y >= ctx.canvas.height) continue
        const idx = (y * W + x) * 4
        if (data[idx + 3] < 30) continue
        rSum += data[idx]; gSum += data[idx + 1]; bSum += data[idx + 2]
        count++
      }
    }
    result.push(count > 0
      ? { r: Math.round(rSum / count), g: Math.round(gSum / count), b: Math.round(bSum / count) }
      : null
    )
  }
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

function paintBleedRing(ctx, cx, cy, innerR, outerR, sectorColors) {
  const sectors = sectorColors.length
  const W = ctx.canvas.width
  const H = ctx.canvas.height
  const yMin = Math.max(0, Math.floor(cy - outerR - 1))
  const yMax = Math.min(H - 1, Math.ceil(cy + outerR + 1))
  const xMin = Math.max(0, Math.floor(cx - outerR - 1))
  const xMax = Math.min(W - 1, Math.ceil(cx + outerR + 1))
  const imageData = ctx.getImageData(xMin, yMin, xMax - xMin + 1, yMax - yMin + 1)
  const data = imageData.data
  const iW = xMax - xMin + 1
  for (let py = yMin; py <= yMax; py++) {
    for (let px = xMin; px <= xMax; px++) {
      const dx = px - cx
      const dy = py - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < innerR || dist > outerR) continue
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
      const fadeT = (dist - innerR) / (outerR - innerR)
      const alpha = Math.round(255 * (1 - fadeT * 0.15))
      const localX = px - xMin
      const localY = py - yMin
      const idx = (localY * iW + localX) * 4
      data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = alpha
    }
  }
  ctx.putImageData(imageData, xMin, yMin)
}

// ─── PinCropper ────────────────────────────────────────────────────────────
function PinCropper({ imageSrc, onConfirm, onCancel, pinDiamMm, bleedMm, exportRadiusPx, innerRadiusPx }) {
  const DISPLAY_INNER = 460
  const DISPLAY_SCALE_CROPPER = DISPLAY_INNER / pinDiamMm
  const DISPLAY_BLEED = Math.round(bleedMm * DISPLAY_SCALE_CROPPER)
  const DISPLAY_SIZE = DISPLAY_INNER + DISPLAY_BLEED * 2
  const EXPORT_SIZE = exportRadiusPx * 2

  const canvasRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imgRef = useRef(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  const [fillEnabled, setFillEnabled] = useState(false)
  const [fillColor, setFillColor] = useState('#ffffff')
  const [outpaintEnabled, setOutpaintEnabled] = useState(false)
  // NEW: bleed color override
  const [bleedColorEnabled, setBleedColorEnabled] = useState(false)
  const [bleedColor, setBleedColor] = useState('#fbfafb')

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
  }, [zoom, offset, imgLoaded, fillEnabled, fillColor, outpaintEnabled, bleedColorEnabled, bleedColor])

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

    // Bleed ring background
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
    ctx.fillStyle = bleedColorEnabled ? bleedColor : '#fbfafb'
    ctx.fill()

    if (fillEnabled) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
      ctx.clip()
      ctx.fillStyle = fillColor
      ctx.fillRect(0, 0, S, S)
      ctx.restore()
    }

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
    ctx.clip()
    const w = img.width * zoom
    const h = img.height * zoom
    ctx.drawImage(img, cx - w / 2 + offset.x, cy - h / 2 + offset.y, w, h)
    ctx.restore()

    if (outpaintEnabled && DISPLAY_BLEED > 0) {
      const ringDepth = Math.max(4, Math.round(innerR * 0.06))
      const sectors = 128
      const borderColors = sampleBorderSectors(ctx, cx, cy, innerR, ringDepth, sectors)
      paintBleedRing(ctx, cx, cy, innerR - 5, outerR, borderColors)
    }

    // Gold border
    ctx.beginPath()
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
    ctx.strokeStyle = '#e2c97e'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Outer bleed border
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

  const handleEyedropper = async (target) => {
    if (!window.EyeDropper) return
    try {
      const result = await new window.EyeDropper().open()
      if (target === 'fill') {
        setFillColor(result.sRGBHex)
        if (!fillEnabled) setFillEnabled(true)
      } else {
        setBleedColor(result.sRGBHex)
        if (!bleedColorEnabled) setBleedColorEnabled(true)
      }
    } catch (_) { }
  }

  const handleConfirm = () => {
    const outerR = exportRadiusPx
    const innerR = innerRadiusPx
    const exportScale = innerR / (DISPLAY_INNER / 2)
    const img = imgRef.current

    const pinSize = innerR * 2
    const offPin = document.createElement('canvas')
    offPin.width = pinSize; offPin.height = pinSize
    const ctxPin = offPin.getContext('2d')
    const pcx = pinSize / 2, pcy = pinSize / 2

    ctxPin.save()
    ctxPin.beginPath()
    ctxPin.arc(pcx, pcy, innerR, 0, Math.PI * 2)
    ctxPin.clip()
    if (fillEnabled) {
      ctxPin.fillStyle = fillColor
      ctxPin.fillRect(0, 0, pinSize, pinSize)
    }
    const w = img.width * zoom * exportScale
    const h = img.height * zoom * exportScale
    ctxPin.drawImage(img, pcx - w / 2 + offset.x * exportScale, pcy - h / 2 + offset.y * exportScale, w, h)
    ctxPin.restore()

    const bleedSize = outerR * 2
    const offBleed = document.createElement('canvas')
    offBleed.width = bleedSize; offBleed.height = bleedSize
    const ctxBleed = offBleed.getContext('2d')
    const bcx = bleedSize / 2, bcy = bleedSize / 2

    // Fill bleed background
    ctxBleed.beginPath()
    ctxBleed.arc(bcx, bcy, outerR, 0, Math.PI * 2)
    ctxBleed.fillStyle = bleedColorEnabled ? bleedColor : '#fbfafb'
    ctxBleed.fill()

    if (outpaintEnabled) {
      if (fillEnabled) {
        ctxBleed.fillStyle = fillColor
        ctxBleed.fillRect(0, 0, bleedSize, bleedSize)
      }
      ctxBleed.save()
      ctxBleed.beginPath()
      ctxBleed.arc(bcx, bcy, innerR, 0, Math.PI * 2)
      ctxBleed.clip()
      ctxBleed.drawImage(img, bcx - w / 2 + offset.x * exportScale, bcy - h / 2 + offset.y * exportScale, w, h)
      ctxBleed.restore()
      const ringDepth = Math.max(8, Math.round(innerR * 0.06))
      const sectors = 256
      const borderColors = sampleBorderSectors(ctxBleed, bcx, bcy, innerR, ringDepth, sectors)
      paintBleedRing(ctxBleed, bcx, bcy, innerR, outerR, borderColors)
    }

    onConfirm({ pinUrl: offPin.toDataURL('image/png'), bleedUrl: offBleed.toDataURL('image/png') })
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
  const colorRowStyle = { display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 21 }
  const eyedropperBtnStyle = {
    background: 'var(--surface3)', border: '1px solid var(--border)',
    borderRadius: 5, padding: '3px 7px', cursor: 'pointer',
    color: 'var(--text-muted)', fontSize: 15, lineHeight: 1,
  }

  return (
    <div className="cropper-overlay z-10000">
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
            style={{ cursor: dragging ? 'grabbing' : 'grab', borderRadius: '50%', display: 'block' }}
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

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 10, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>

            {/* ── GROUP: Sangría ─────────────────────────────── */}
            <div style={{
              border: '1px solid rgba(184,134,11,0.25)',
              borderRadius: 8, overflow: 'hidden',
            }}>
              <div style={{
                background: 'rgba(184,134,11,0.08)',
                padding: '4px 10px',
                fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                color: 'var(--gold)', textTransform: 'uppercase',
                borderBottom: '1px solid rgba(184,134,11,0.15)',
              }}>
                Sangría
              </div>
              <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>

                {/* Bleed color */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: bleedColorEnabled ? '2px solid var(--gold)' : '2px solid var(--border)',
                    background: bleedColorEnabled ? 'var(--gold)' : 'var(--surface3)',
                    transition: 'all 0.15s ease',
                  }}>
                    {bleedColorEnabled && <Check size={10} strokeWidth={3} color="#1a1a1a" />}
                    <input type="checkbox" checked={bleedColorEnabled} onChange={e => setBleedColorEnabled(e.target.checked)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                  </span>
                  <span style={{ fontSize: 12, color: bleedColorEnabled ? 'var(--text)' : 'var(--text-muted)', transition: 'color 0.15s' }}>Color de sangría personalizado</span>
                </label>
                {bleedColorEnabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 24 }}>
                    <div style={{ position: 'relative', width: 28, height: 28, borderRadius: 5, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                      <input type="color" value={bleedColor} onChange={e => setBleedColor(e.target.value)}
                        style={{ position: 'absolute', inset: '-4px', width: 'calc(100% + 8px)', height: 'calc(100% + 8px)', border: 'none', cursor: 'pointer', padding: 0 }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{bleedColor}</span>
                    {window.EyeDropper && <button onClick={() => handleEyedropper('bleed')} title="Cuentagotas sangría" style={eyedropperBtnStyle}>💧</button>}
                  </div>
                )}

                {/* Outpaint */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: outpaintEnabled ? '2px solid var(--gold)' : '2px solid var(--border)',
                    background: outpaintEnabled ? 'var(--gold)' : 'var(--surface3)',
                    transition: 'all 0.15s ease',
                  }}>
                    {outpaintEnabled && <Check size={10} strokeWidth={3} color="#1a1a1a" />}
                    <input type="checkbox" checked={outpaintEnabled} onChange={e => setOutpaintEnabled(e.target.checked)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                  </span>
                  <span style={{ fontSize: 12, color: outpaintEnabled ? 'var(--text)' : 'var(--text-muted)', transition: 'color 0.15s' }}>Difusión de borde en sangría</span>
                </label>
                {outpaintEnabled && (
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 24, margin: 0, lineHeight: 1.4 }}>
                    El anillo exterior adoptará los colores del borde{fillEnabled ? ' y del relleno' : ' de la imagen'}.
                  </p>
                )}

              </div>
            </div>

            {/* ── GROUP: Imagen interna ──────────────────────── */}
            <div style={{
              border: '1px solid rgba(100,140,255,0.22)',
              borderRadius: 8, overflow: 'hidden',
            }}>
              <div style={{
                background: 'rgba(100,140,255,0.07)',
                padding: '4px 10px',
                fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                color: '#8aaeff', textTransform: 'uppercase',
                borderBottom: '1px solid rgba(100,140,255,0.15)',
              }}>
                Imagen interna
              </div>
              <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>

                {/* Fill color */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: fillEnabled ? '2px solid #8aaeff' : '2px solid var(--border)',
                    background: fillEnabled ? '#8aaeff' : 'var(--surface3)',
                    transition: 'all 0.15s ease',
                  }}>
                    {fillEnabled && <Check size={10} strokeWidth={3} color="#1a1a1a" />}
                    <input type="checkbox" checked={fillEnabled} onChange={e => setFillEnabled(e.target.checked)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                  </span>
                  <span style={{ fontSize: 12, color: fillEnabled ? 'var(--text)' : 'var(--text-muted)', transition: 'color 0.15s' }}>Rellenar espacios vacíos</span>
                </label>
                {fillEnabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 24 }}>
                    <div style={{ position: 'relative', width: 28, height: 28, borderRadius: 5, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                      <input type="color" value={fillColor} onChange={e => setFillColor(e.target.value)}
                        style={{ position: 'absolute', inset: '-4px', width: 'calc(100% + 8px)', height: 'calc(100% + 8px)', border: 'none', cursor: 'pointer', padding: 0 }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{fillColor}</span>
                    {window.EyeDropper && <button onClick={() => handleEyedropper('fill')} title="Cuentagotas" style={eyedropperBtnStyle}>💧</button>}
                  </div>
                )}

              </div>
            </div>

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
function PinSlot({ index, imageData, bleedUrl, isSelected, onClick, onEdit, onRemove, onUpload, onDrop, displayRadius, outerBleed, onCopy, onPaste, hasClipboard }) {
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
      {/* Bleed ring */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: bleedSize, height: bleedSize,
        borderRadius: '50%',
        backgroundColor: '#fbfafb',
        border: '1px solid #d4d4d4',
        zIndex: 0,
        pointerEvents: 'none',
        ...(bleedUrl && {
          backgroundImage: `url(${bleedUrl})`,
          backgroundSize: '100% 100%',
          border: '1px solid #d4d4d4',  // FIX: keep border even with bleed image
        }),
      }} />

      {/* Inner circle */}
      <div
        className={`pin-slot ${isSelected ? 'selected' : ''} ${dragOver ? 'drag-over' : ''} ${imageData ? 'has-image' : ''}`}
        style={{ width: '100%', height: '100%', borderRadius: '50%', position: 'relative', zIndex: 1 }}
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

      {/* Floating toolbar */}
      {isSelected && (
        <ButtonGroup className="absolute z-100" style={{
          bottom: '100%', left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '5px'
        }}>
          {imageData ? (
            <>
              <Button variant="secondary" size="lg" className="px-2! py-2!" onClick={onEdit}><Edit /> Editar</Button>
              <Button variant="secondary" size="lg" className="px-2! py-2!" onClick={onCopy} title="Copiar pin"><Copy size={14} /></Button>
              <Button variant="secondary" size="lg" className="px-3! py-2!" onClick={onRemove}><TrashIcon className="text-red-600" /></Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="lg" className="px-2! py-2!" onClick={onUpload}><Upload size={14} /> Cargar</Button>
              {hasClipboard && (
                <Button variant="secondary" size="lg" className="px-2! py-2!" onClick={onPaste} title="Pegar pin copiado">
                  <ClipboardPaste size={14} />
                </Button>
              )}
            </>
          )}
        </ButtonGroup>
      )}
    </div>
  )
}

// ─── LockableInput ─────────────────────────────────────────────────────────
function LockableInput({ label, value, inputValue, onChange, min, max, step, unit, linked, onLinkToggle, linkedLabel, frozen, onFreezeToggle }) {
  const inputStyle = {
    width: 60, background: frozen ? 'var(--surface)' : 'var(--surface3)', border: '1px solid var(--border)',
    borderRadius: 5, color: frozen ? 'var(--text-muted)' : 'var(--text)', padding: '3px 6px',
    fontSize: 13, textAlign: 'right', outline: 'none',
    opacity: frozen ? 0.6 : 1,
  }
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {onLinkToggle && (
            <button onClick={onLinkToggle} title={linked ? `Desconectar de ${linkedLabel}` : `Vincular con ${linkedLabel}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: linked ? 'var(--gold)' : 'var(--text-muted)', padding: '0 2px' }}>
              {linked ? <Link2 size={11} /> : <Unlink2 size={11} />}
            </button>
          )}
          {onFreezeToggle && (
            <button onClick={onFreezeToggle} title={frozen ? 'Desbloquear valor' : 'Bloquear valor (no editable)'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: frozen ? 'var(--gold)' : 'var(--text-muted)', padding: '0 2px' }}>
              {frozen ? <Lock size={11} /> : <Unlock size={11} />}
            </button>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <input type="number" min={min} max={max} step={step}
          value={inputValue} onChange={e => onChange(e.target.value)}
          disabled={frozen}
          style={inputStyle} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={frozen}
        style={{ width: '100%', marginTop: 4, accentColor: 'var(--gold)', opacity: frozen ? 0.4 : 1 }} />
    </div>
  )
}

// ─── CeldsOverlay ──────────────────────────────────────────────────────────
function CeldsOverlay({ positions, radius, w, h }) {
  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }} width={w} height={h}>
      {positions.map((pos, i) => (
        <g key={i}>
          <circle cx={pos.x} cy={pos.y} r={radius} fill="none" stroke="#1e88e5" strokeWidth="1" strokeDasharray="4 3" opacity="0.75" />
          <line x1={pos.x - 7} y1={pos.y} x2={pos.x + 7} y2={pos.y} stroke="#1e88e5" strokeWidth="0.8" opacity="0.75" />
          <line x1={pos.x} y1={pos.y - 7} x2={pos.x} y2={pos.y + 7} stroke="#1e88e5" strokeWidth="0.8" opacity="0.75" />
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
  const pinitFileInputRef = useRef(null)

  // ── Config ────────────────────────────────────────────────────────────
  const [pinDiamMm, setPinDiamMm] = useState(DEFAULT_PIN_DIAM_MM)
  const [bleedMm, setBleedMm] = useState(DEFAULT_BLEED_MM)
  const [pinDiamInput, setPinDiamInput] = useState(String(DEFAULT_PIN_DIAM_MM))
  const [bleedInput, setBleedInput] = useState(String(DEFAULT_BLEED_MM))
  const [bleedImages, setBleedImages] = useState(Array(DEFAULT_COLS * DEFAULT_ROWS).fill(null))

  // ── Grid ──────────────────────────────────────────────────────────────
  const [gridCols, setGridCols] = useState(DEFAULT_COLS)
  const [gridRows, setGridRows] = useState(DEFAULT_ROWS)
  const [gapXMm, setGapXMm] = useState(DEFAULT_GAP_X_MM)
  const [gapYMm, setGapYMm] = useState(DEFAULT_GAP_Y_MM)
  const [colsInput, setColsInput] = useState(String(DEFAULT_COLS))
  const [rowsInput, setRowsInput] = useState(String(DEFAULT_ROWS))
  const [gapXInput, setGapXInput] = useState(String(DEFAULT_GAP_X_MM))
  const [gapYInput, setGapYInput] = useState(String(DEFAULT_GAP_Y_MM))
  const [gapLocked, setGapLocked] = useState(false)

  // ── Locks ─────────────────────────────────────────────────────────────
  const [pinBleedLocked, setPinBleedLocked] = useState(false)
  const [pinDiamFrozen, setPinDiamFrozen] = useState(false)
  const [bleedFrozen, setBleedFrozen] = useState(false)
  const [gapXFrozen, setGapXFrozen] = useState(false)
  const [gapYFrozen, setGapYFrozen] = useState(false)

  // ── Pin clipboard ──────────────────────────────────────────────────────
  const [pinClipboard, setPinClipboard] = useState(null) // { pinUrl, bleedUrl, original }

  // ── Templates ─────────────────────────────────────────────────────────
  const [templates, setTemplates] = useState([])
  const [templateName, setTemplateName] = useState('')
  const [showTemplateDD, setShowTemplateDD] = useState(false)
  const templateDDRef = useRef(null)
  const [templateToast, setTemplateToast] = useState(null)

  // ── A4 zoom (adaptive) ────────────────────────────────────────────────
  const [a4Zoom, setA4Zoom] = useState(1.0)
  const a4ContainerRef = useRef(null)
  const [containerSize, setContainerSize] = useState({ w: 1100, h: 750 })
  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const saved = await window.ipcRenderer.invoke('templates:list')
        if (saved) setTemplates(saved)
      } catch (_) {
        // fallback: localStorage
        try {
          const raw = localStorage.getItem('pinit-templates')
          if (raw) setTemplates(JSON.parse(raw))
        } catch (_) { }
      }
    }
    loadTemplates()
  }, [])

  // Close template dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (templateDDRef.current && !templateDDRef.current.contains(e.target)) {
        setShowTemplateDD(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Adaptive A4 zoom: observe container size
  useEffect(() => {
    if (!a4ContainerRef.current) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        console.log(width, height)
        setContainerSize({ w: width, h: height })
      }
    })
    ro.observe(a4ContainerRef.current)
    return () => ro.disconnect()
  }, [])

  // Auto-fit zoom to fill container
  const A4_ASPECT = A4_H_MM / A4_W_MM
  const A4_BASE_W = 480  // base reference width
  const fitZoom = Math.min(
    (containerSize.w - 60) / A4_BASE_W,
    (containerSize.h - 120) / (A4_BASE_W * A4_ASPECT)
  )
  const A4_DISPLAY_W = Math.round(A4_BASE_W * a4Zoom * fitZoom)
  const A4_DISPLAY_H = Math.round(A4_DISPLAY_W * A4_ASPECT)
  const DISPLAY_SCALE = A4_DISPLAY_W / A4_W_MM
  const PIN_DISPLAY_RADIUS = Math.round((pinDiamMm / 2) * DISPLAY_SCALE)

  const PIN_FRACTIONS = calcPinFractions(gridCols, gridRows, gapXMm, gapYMm)
  const TOTAL_PINS = gridCols * gridRows
  const { pinRadiusMm: PIN_RADIUS_MM, pinRadiusPx300: PIN_RADIUS_PX_300, exportRadiusPx: EXPORT_RADIUS_PX } = calcExportConstants(pinDiamMm, bleedMm)

  const pinDisplayPositions = PIN_FRACTIONS.map(([fx, fy]) => ({
    x: Math.round(fx * A4_DISPLAY_W),
    y: Math.round(fy * A4_DISPLAY_H),
  }))

  // ── Handlers ──────────────────────────────────────────────────────────
  const handlePinDiamChange = (val) => {
    if (pinDiamFrozen) return
    setPinDiamInput(val)
    const n = parseFloat(val)
    if (!isNaN(n) && n >= 10 && n <= 120) {
      setPinDiamMm(n)
      if (pinBleedLocked) {
        // keep bleed ratio
        const ratio = bleedMm / pinDiamMm
        const newBleed = parseFloat((n * ratio).toFixed(2))
        setBleedMm(newBleed)
        setBleedInput(String(newBleed))
      }
    }
  }

  const handleBleedChange = (val) => {
    if (bleedFrozen) return
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
      setBleedImages(prev => Array(n * gridRows).fill(null).map((_, i) => prev[i] ?? null))
    }
  }

  const handleRowsChange = (val) => {
    setRowsInput(val)
    const n = parseInt(val)
    if (!isNaN(n) && n >= 1 && n <= 8) {
      setGridRows(n)
      setPins(prev => Array(gridCols * n).fill(null).map((_, i) => prev[i] ?? null))
      setOriginals(prev => Array(gridCols * n).fill(null).map((_, i) => prev[i] ?? null))
      setBleedImages(prev => Array(gridCols * n).fill(null).map((_, i) => prev[i] ?? null))
    }
  }

  const handleGapXChange = (val) => {
    if (gapXFrozen) return
    setGapXInput(val)
    const n = parseFloat(val)
    if (!isNaN(n) && n >= 10 && n <= 200) {
      setGapXMm(n)
      if (gapLocked) {
        const ratio = gapYMm / gapXMm
        const newY = parseFloat((n * ratio).toFixed(2))
        setGapYMm(newY)
        setGapYInput(String(newY))
      }
    }
  }

  const handleGapYChange = (val) => {
    if (gapYFrozen) return
    setGapYInput(val)
    const n = parseFloat(val)
    if (!isNaN(n) && n >= 10 && n <= 200) {
      setGapYMm(n)
      if (gapLocked) {
        const ratio = gapXMm / gapYMm
        const newX = parseFloat((n * ratio).toFixed(2))
        setGapXMm(newX)
        setGapXInput(String(newX))
      }
    }
  }

  const handleSlotClick = (idx) => {
    if (pins[idx]) {
      setSelectedSlot(idx === selectedSlot ? null : idx)
    } else {
      setSelectedSlot(idx === selectedSlot ? null : idx)
    }
  }

  const handleSlotUpload = (idx) => {
    setSelectedSlot(idx)
    fileInputRef.current.value = ''
    fileInputRef.current.click()
  }

  const handleEditSlot = (idx) => {
    const target = idx !== undefined ? idx : selectedSlot
    if (target === null) return
    const src = originals[target] || pins[target]
    setCropTarget({ imageSrc: src, slotIndex: target })
  }

  const handleRemoveSlot = (idx) => {
    setPins(prev => { const n = [...prev]; n[idx] = null; return n })
    setOriginals(prev => { const n = [...prev]; n[idx] = null; return n })
    setBleedImages(prev => { const n = [...prev]; n[idx] = null; return n })
    if (selectedSlot === idx) setSelectedSlot(null)
  }

  const handleCopyPin = (idx) => {
    if (!pins[idx]) return
    setPinClipboard({ pinUrl: pins[idx], bleedUrl: bleedImages[idx], original: originals[idx] })
  }

  const handlePastePin = (idx) => {
    if (!pinClipboard) return
    setPins(prev => { const n = [...prev]; n[idx] = pinClipboard.pinUrl; return n })
    setBleedImages(prev => { const n = [...prev]; n[idx] = pinClipboard.bleedUrl; return n })
    setOriginals(prev => { const n = [...prev]; n[idx] = pinClipboard.original; return n })
    setSelectedSlot(null)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const imageSrc = URL.createObjectURL(file)
    setOriginals(prev => { const n = [...prev]; n[selectedSlot] = imageSrc; return n })
    setCropTarget({ imageSrc, slotIndex: selectedSlot })
  }

  const handleCropConfirm = ({ pinUrl, bleedUrl }) => {
    setPins(prev => { const n = [...prev]; n[cropTarget.slotIndex] = pinUrl; return n })
    setBleedImages(prev => { const n = [...prev]; n[cropTarget.slotIndex] = bleedUrl; return n })
    setSelectedSlot(null)
    setCropTarget(null)
  }

  const handleSlotDrop = (targetIdx, sourceIdx) => {
    if (sourceIdx === targetIdx) return
    setPins(prev => { const n = [...prev];[n[targetIdx], n[sourceIdx]] = [n[sourceIdx], n[targetIdx]]; return n })
    setOriginals(prev => { const n = [...prev];[n[targetIdx], n[sourceIdx]] = [n[sourceIdx], n[targetIdx]]; return n })
    setBleedImages(prev => { const n = [...prev];[n[targetIdx], n[sourceIdx]] = [n[sourceIdx], n[targetIdx]]; return n })
  }

  // ── Clipboard paste ────────────────────────────────────────────────────
  const handleImageFromClipboard = useCallback((url) => {
    const targetSlot = selectedSlot !== null ? selectedSlot : pins.findIndex(p => p === null)
    if (targetSlot === -1) return
    setSelectedSlot(targetSlot)
    setOriginals(prev => { const n = [...prev]; n[targetSlot] = url; return n })
    setCropTarget({ imageSrc: url, slotIndex: targetSlot })
  }, [pins, selectedSlot])

  useEffect(() => {
    const handlePaste = (e) => {
      if (cropTarget) return // don't intercept while cropper is open
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          const url = URL.createObjectURL(file)
          handleImageFromClipboard(url)
          break
        }
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [handleImageFromClipboard, cropTarget])

  useEffect(() => {
    const handleWheel = (e) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      setA4Zoom(z => Math.min(3, Math.max(0.3, z * (1 - e.deltaY * 0.001))))
    }
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  // ── Config templates ───────────────────────────────────────────────────
  const currentConfig = () => ({
    pinDiamMm, bleedMm, gridCols, gridRows, gapXMm, gapYMm
  })

  const saveTemplate = async () => {
    const name = templateName.trim() || `Plantilla ${templates.length + 1}`
    const tpl = { name, ...currentConfig(), createdAt: Date.now() }
    const updated = [...templates.filter(t => t.name !== name), tpl]
    setTemplates(updated)
    setTemplateName('')
    try {
      await window.ipcRenderer.invoke('templates:save', updated)
    } catch (_) {
      localStorage.setItem('pinit-templates', JSON.stringify(updated))
    }
  }

  const loadTemplate = (tpl) => {
    setPinDiamMm(tpl.pinDiamMm); setPinDiamInput(String(tpl.pinDiamMm))
    setBleedMm(tpl.bleedMm); setBleedInput(String(tpl.bleedMm))
    setGridCols(tpl.gridCols); setColsInput(String(tpl.gridCols))
    setGridRows(tpl.gridRows); setRowsInput(String(tpl.gridRows))
    setGapXMm(tpl.gapXMm); setGapXInput(String(tpl.gapXMm))
    setGapYMm(tpl.gapYMm); setGapYInput(String(tpl.gapYMm))
    // NOTE: images are preserved intentionally — only config changes
    setShowTemplateDD(false)
    if (tpl.name) {
      setTemplateToast(tpl.name)
      setTimeout(() => setTemplateToast(null), 2500)
    }
  }

  const deleteTemplate = async (name) => {
    const updated = templates.filter(t => t.name !== name)
    setTemplates(updated)
    try {
      await window.ipcRenderer.invoke('templates:save', updated)
    } catch (_) {
      localStorage.setItem('pinit-templates', JSON.stringify(updated))
    }
  }

  // ── Export PNG ─────────────────────────────────────────────────────────
  const handleExportPNG = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = A4_W_PX; canvas.height = A4_H_PX
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, A4_W_PX, A4_H_PX)

    await Promise.all(
      PIN_FRACTIONS.map(([fx, fy], idx) => new Promise(resolve => {
        if (!pins[idx]) { resolve(); return }
        const cx = fx * A4_W_PX, cy = fy * A4_H_PX
        const r = PIN_RADIUS_PX_300, outerR = EXPORT_RADIUS_PX

        const drawPin = (bleedDone) => {
          const pinImg = new Image()
          pinImg.onload = () => {
            const overlap = bleedDone ? 1 : 0
            ctx.drawImage(pinImg, cx - r - overlap, cy - r - overlap, (r + overlap) * 2, (r + overlap) * 2)
            ctx.beginPath()
            ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
            ctx.strokeStyle = '#555555'; ctx.lineWidth = 1.5; ctx.stroke()
            resolve()
          }
          pinImg.src = pins[idx]
        }

        if (bleedImages[idx]) {
          const bleedImg = new Image()
          bleedImg.onload = () => {
            ctx.drawImage(bleedImg, cx - outerR, cy - outerR, outerR * 2, outerR * 2)
            drawPin(true)
          }
          bleedImg.src = bleedImages[idx]
        } else {
          ctx.beginPath()
          ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
          ctx.fillStyle = '#fbfafb'; ctx.fill()
          drawPin(false)
        }
      }))
    )

    // Export PNG only
    const link = document.createElement('a')
    link.download = `pines_a4_300dpi_${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  // ── Save .pinit ────────────────────────────────────────────────────────
  const handleSavePinit = () => {
    const pinitData = {
      version: 1,
      config: currentConfig(),
      pins: pins,
      bleedImages: bleedImages,
      originals: originals,
      exportedAt: Date.now(),
    }
    const pinitBlob = new Blob([JSON.stringify(pinitData)], { type: 'application/json' })
    const pinitUrl = URL.createObjectURL(pinitBlob)
    const pinitLink = document.createElement('a')
    pinitLink.download = `pines_${Date.now()}.pinit`
    pinitLink.href = pinitUrl
    pinitLink.click()
  }

  // ── Load .pinit ────────────────────────────────────────────────────────
  const handleLoadPinit = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        // Apply config without touching images
        if (data.config) {
          const tpl = data.config
          setPinDiamMm(tpl.pinDiamMm); setPinDiamInput(String(tpl.pinDiamMm))
          setBleedMm(tpl.bleedMm); setBleedInput(String(tpl.bleedMm))
          setGridCols(tpl.gridCols); setColsInput(String(tpl.gridCols))
          setGridRows(tpl.gridRows); setRowsInput(String(tpl.gridRows))
          setGapXMm(tpl.gapXMm); setGapXInput(String(tpl.gapXMm))
          setGapYMm(tpl.gapYMm); setGapYInput(String(tpl.gapYMm))
        }
        // Restore images from the .pinit file itself
        if (data.pins) setPins(data.pins)
        if (data.bleedImages) setBleedImages(data.bleedImages)
        if (data.originals) setOriginals(data.originals)
        setTemplateToast(file.name.replace(/\.pinit$/, ''))
        setTimeout(() => setTemplateToast(null), 2500)
      } catch (_) {
        alert('No se pudo cargar el archivo .pinit')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── Updates ────────────────────────────────────────────────────────────
  const [updateState, setUpdateState] = useState(null)  // null | 'available' | 'downloading'
  const [updateVersion, setUpdateVersion] = useState('')
  const [updateProgress, setUpdateProgress] = useState(0)
  const updateUserAccepted = useRef(false)

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
      // El usuario ya aceptó descargar → instalar directo, sin preguntar de nuevo
      if (updateUserAccepted.current) {
        window.ipcRenderer.send('update:install')
      }
    })
  }, [])

  const filledCount = pins.filter(Boolean).length

  const inputStyle = {
    width: 60, background: 'var(--surface3)', border: '1px solid var(--border)',
    borderRadius: 5, color: 'var(--text)', padding: '3px 6px',
    fontSize: 13, textAlign: 'right', outline: 'none',
  }
  const unitStyle = { fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }
  const sectionDivider = <div style={{ height: 1, background: 'var(--border)', margin: '6px 0 12px' }} />
  const sectionLabel = (text) => <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 8 }}>{text}</div>

  return (
    <div className="app-root flex flex-col">
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
      <input ref={pinitFileInputRef} type="file" accept=".pinit" style={{ display: 'none' }} onChange={handleLoadPinit} />

      {/* Header */}
      <header className="tittle-bar flex justify-between items-center z-1 border-b-2 p-1">
        <div className="flex items-center gap-2">
          <img src={PinitIcon} className="h-10 w-10 object-contain pl-1!" alt="" />
          <span className="app-title">PINIT</span>
        </div>
        <ButtonGroup className="windows-button bg-scroll z-90">
          <Button variant="outline" className="px-2! py-2!" onClick={() => window.ipcRenderer.minimize()}><Minus /></Button>
          <Button variant="outline" className="px-2! py-2!" onClick={() => window.ipcRenderer.toggleMaximize()}><Square /></Button>
          <Button variant="outline" className="px-2! py-2!" onClick={() => window.ipcRenderer.close()}><X className="text-red-600" /></Button>
        </ButtonGroup>
      </header>

      <span className="kev absolute bottom-1 left-1">made by kev</span>

      <div className="flex w-screen flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside style={{
          width: 188, minWidth: 188, background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 0,
          padding: '12px 12px', overflowY: 'auto',
        }}>
          {sectionLabel('CONFIGURACIÓN')}

          {/* Templates dropdown */}
          <div style={{ marginBottom: 10 }} ref={templateDDRef}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 4 }}>PLANTILLAS</div>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowTemplateDD(v => !v)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 5,
                  color: 'var(--text)', padding: '4px 8px', fontSize: 12, cursor: 'pointer',
                }}
              >
                <span>Cargar plantilla</span>
                <ChevronDown size={12} />
              </button>
              {showTemplateDD && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 6, marginTop: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  maxHeight: 200, overflowY: 'auto',
                }}>
                  {templates.length === 0 ? (
                    <div style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-muted)' }}>No hay plantillas guardadas</div>
                  ) : templates.map(tpl => (
                    <div key={tpl.name} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 10px', fontSize: 12, cursor: 'pointer',
                      borderBottom: '1px solid var(--border)',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span onClick={() => loadTemplate(tpl)} style={{ flex: 1 }}>{tpl.name}</span>
                      <button onClick={() => deleteTemplate(tpl.name)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Save template */}
            <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
              <input
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveTemplate()}
                placeholder="Nombre..."
                style={{ ...inputStyle, width: '100%', textAlign: 'left', fontSize: 11, padding: '3px 7px' }}
              />
              <button onClick={saveTemplate} title="Guardar plantilla"
                style={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 7px', cursor: 'pointer', color: 'var(--gold)' }}>
                <Save size={12} />
              </button>
            </div>
          </div>

          {sectionDivider}

          {/* Pin diameter */}
          <LockableInput
            label="TAMAÑO DEL PIN"
            value={pinDiamMm} inputValue={pinDiamInput}
            onChange={handlePinDiamChange}
            min={10} max={120} step={0.5} unit="mm"
            linked={pinBleedLocked} onLinkToggle={() => setPinBleedLocked(v => !v)}
            linkedLabel="sangría"
            frozen={pinDiamFrozen} onFreezeToggle={() => setPinDiamFrozen(v => !v)}
          />

          {/* Bleed */}
          <LockableInput
            label="SANGRÍA (BORDE EXTRA)"
            value={bleedMm} inputValue={bleedInput}
            onChange={handleBleedChange}
            min={0} max={20} step={0.1} unit="mm"
            frozen={bleedFrozen} onFreezeToggle={() => setBleedFrozen(v => !v)}
          />

          {sectionDivider}

          {/* Cols */}
          <LockableInput
            label="COLUMNAS"
            value={gridCols} inputValue={colsInput}
            onChange={handleColsChange}
            min={1} max={6} step={1} unit="cols"
          />

          {/* Rows */}
          <LockableInput
            label="FILAS"
            value={gridRows} inputValue={rowsInput}
            onChange={handleRowsChange}
            min={1} max={8} step={1} unit="filas"
          />

          {sectionDivider}

          {/* Gap X */}
          <LockableInput
            label="SEPARACIÓN HORIZONTAL"
            value={gapXMm} inputValue={gapXInput}
            onChange={handleGapXChange}
            min={10} max={200} step={0.5} unit="mm"
            linked={gapLocked} onLinkToggle={() => setGapLocked(v => !v)}
            linkedLabel="vertical"
            frozen={gapXFrozen} onFreezeToggle={() => setGapXFrozen(v => !v)}
          />

          {/* Gap Y */}
          <LockableInput
            label="SEPARACIÓN VERTICAL"
            value={gapYMm} inputValue={gapYInput}
            onChange={handleGapYChange}
            min={10} max={200} step={0.5} unit="mm"
            frozen={gapYFrozen} onFreezeToggle={() => setGapYFrozen(v => !v)}
          />

          {sectionDivider}


          {/* Bottom-right actions */}
          <div className="flex flex-col gap-2 w-full">
            <Button className="btn-gold w-full" onClick={handleExportPNG} disabled={filledCount === 0}>
              <Download size={15} /> Exportar PNG
            </Button>
            <Button variant="ghost" className="btn-ghost-muted w-full" onClick={handleSavePinit} disabled={filledCount === 0}>
              <Save size={14} /> Guardar .pinit
            </Button>
            <Button variant="ghost" className="btn-ghost-muted w-full"
              onClick={() => pinitFileInputRef.current.click()}>
              <FolderOpen size={14} /> Cargar plantilla .pinit
            </Button>
            <Button variant="ghost" className="btn-ghost-muted w-full"
              onClick={() => { if (confirm('¿Limpiar todos los slots?')) { setPins(Array(TOTAL_PINS).fill(null)); setOriginals(Array(TOTAL_PINS).fill(null)); setBleedImages(Array(TOTAL_PINS).fill(null)) } }}
              disabled={filledCount === 0}
            >
              <Trash2 size={14} /> Limpiar todo
            </Button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <main className="main-area flex-1 flex flex-col overflow-hidden" style={{ padding: 0 }}>

            {/* Top bar: progress + zoom controls */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '8px 16px', borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}>
              <div style={{ minWidth: 180 }}>
                <div className="section-label" style={{ marginBottom: 4 }}>PROGRESO</div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar" style={{ width: `${(filledCount / TOTAL_PINS) * 100}%` }} />
                </div>
                <div className="progress-label">{filledCount} / {TOTAL_PINS} pines</div>
              </div>

              <p className="upload-hint" style={{ flex: 1, margin: 0 }}>
                {selectedSlot !== null
                  ? `→ Slot ${selectedSlot + 1} seleccionado · Ctrl+V para pegar`
                  : 'Click en un slot para seleccionarlo'}
              </p>

              {/* A4 Zoom controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>ZOOM - usar CTRL + Wheel</span>
                <button onClick={() => setA4Zoom(z => Math.max(0.3, z - 0.1))}
                  style={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', color: 'var(--text)' }}>
                  <ZoomOut size={13} />
                </button>
                <span style={{ fontSize: 12, color: 'var(--text)', minWidth: 36, textAlign: 'center' }}>{Math.round(a4Zoom * 100)}%</span>
                <button onClick={() => setA4Zoom(z => Math.min(3, z + 0.1))}
                  style={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', color: 'var(--text)' }}>
                  <ZoomIn size={13} />
                </button>
                <button onClick={() => setA4Zoom(1.0)} title="Restablecer zoom"
                  style={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>

            {/* A4 canvas area — fills remaining space */}
            <div
              ref={a4ContainerRef}
              style={{
                flex: 1, overflow: 'auto', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                padding: 20, minHeight: 0,
              }}
              className="min-w-[80vw]"
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedSlot(null) }}
            >
              <div
                className="a4-sheet z-0"
                style={{ width: A4_DISPLAY_W, height: A4_DISPLAY_H, position: 'relative', flexShrink: 0, margin: 'auto' }}
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
                      onUpload={() => handleSlotUpload(idx)}
                      onDrop={(src) => handleSlotDrop(idx, src)}
                      onCopy={() => handleCopyPin(idx)}
                      onPaste={() => handlePastePin(idx)}
                      hasClipboard={!!pinClipboard}
                      displayRadius={PIN_DISPLAY_RADIUS}
                      outerBleed={bleedMm * DISPLAY_SCALE}
                      bleedUrl={bleedImages[idx]}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="canvas-footer" style={{ flexShrink: 0 }}>
              Arrastrá pines para reordenarlos · Click en slot vacío para cargar imagen · Ctrl+V para pegar · Copiá y pegá pines entre slots
            </div>
          </main>
        </div>
      </div>

      {/* Template toast */}
      {templateToast && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface)', border: '1px solid var(--gold)',
          borderRadius: 8, padding: '8px 18px', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          animation: 'fadeInUp 0.2s ease',
        }}
          className="w-[20vw] h-[5vh] items-center">
          <Check size={18} style={{ color: 'var(--gold)' }} />
          <span style={{ fontSize: 20, color: 'var(--text)', fontFamily: 'Bebas Neue', letterSpacing: '0.06em' }}>
            Plantilla cargada: {templateToast}
          </span>
        </div>
      )}


      {cropTarget && (
        <PinCropper
          imageSrc={cropTarget.imageSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => { setCropTarget(null); setSelectedSlot(null) }}
          pinDiamMm={pinDiamMm}
          bleedMm={bleedMm}
          exportRadiusPx={EXPORT_RADIUS_PX}
          innerRadiusPx={Math.round(PIN_RADIUS_PX_300)}
        />
      )}
      <div className="w-[10vw] absolute top-10 left-50">
        <div className="section-label">ESPECIFICACIONES</div>
        <div className="spec-row"><span>Hoja</span><span>A4 {A4_W_MM}×{A4_H_MM}mm</span></div>
        <div className="spec-row"><span>Resolución</span><span>300 DPI</span></div>
        <div className="spec-row"><span>Output</span><span>2480×3508px</span></div>
      </div>


      {updateState && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
          // Bloquear interacción con la app durante la descarga
          pointerEvents: 'all',
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--gold)', borderRadius: 14,
            padding: '28px 32px', minWidth: 360, display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--gold)', letterSpacing: '0.08em' }}>
              {updateState === 'available' && '✨ Nueva versión disponible'}
              {updateState === 'downloading' && '⬇️ Descargando actualización...'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {updateState === 'available' && `Versión ${updateVersion} disponible. ¿Querés descargarla e instalarla ahora?`}
              {updateState === 'downloading' && 'La app se va a reiniciar automáticamente cuando termine.'}
            </div>
            {updateState === 'downloading' && (
              <div>
                <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: 'var(--gold)', width: `${updateProgress}%`, transition: 'width 0.3s ease' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>{updateProgress}%</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {updateState === 'available' && (
                <>
                  <Button className="btn-ghost-muted px-2! py-3!" size="sm" onClick={() => setUpdateState(null)}>Ahora no</Button>
                  <Button className="btn-gold px-2! py-3!" size="sm" onClick={() => {
                    updateUserAccepted.current = true
                    window.ipcRenderer.send('update:start-download')
                    setUpdateState('downloading')
                  }}>Descargar e instalar</Button>
                </>
              )}
              {updateState === 'downloading' && (
                <Button className="btn-ghost-muted" size="sm" disabled>Descargando... {updateProgress}%</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}