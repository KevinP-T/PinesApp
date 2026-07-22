import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { CircleDashed, Move, ZoomOut, ZoomIn, RotateCcw, Check } from "lucide-react"

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
export default function PinCropper({ imageSrc, onConfirm, onCancel, pinDiamMm, bleedMm, exportRadiusPx, innerRadiusPx }) {
  const DISPLAY_INNER = 460
  const DISPLAY_SCALE_CROPPER = DISPLAY_INNER / pinDiamMm
  const DISPLAY_BLEED = Math.round(bleedMm * DISPLAY_SCALE_CROPPER)
  const DISPLAY_SIZE = DISPLAY_INNER + DISPLAY_BLEED * 2
  const SAFE_MM = 3.5

  const canvasRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 })
  const imgRef = useRef(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  const [fillEnabled, setFillEnabled] = useState(false)
  const [fillColor, setFillColor] = useState('#ffffff')
  const [outpaintEnabled, setOutpaintEnabled] = useState(false)
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

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
    const DISPLAY_SAFE = Math.round(SAFE_MM * DISPLAY_SCALE_CROPPER)
    const safeR = innerR - DISPLAY_SAFE

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
    setDragStart({ x: e.clientX, y: e.clientY })
    setInitialOffset({ x: offset.x, y: offset.y })
  }
  const onMouseMove = (e) => {
    if (!dragging || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleFactor = rect.width ? (DISPLAY_SIZE / rect.width) : 1
    const dx = (e.clientX - dragStart.x) * scaleFactor
    const dy = (e.clientY - dragStart.y) * scaleFactor
    setOffset({ x: initialOffset.x + dx, y: initialOffset.y + dy })
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

    ctxBleed.save()
    ctxBleed.beginPath()
    ctxBleed.arc(bcx, bcy, outerR, 0, Math.PI * 2)
    ctxBleed.clip()

    ctxBleed.fillStyle = bleedColorEnabled ? bleedColor : '#fbfafb'
    ctxBleed.fillRect(0, 0, bleedSize, bleedSize)

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

    ctxBleed.restore()

    onConfirm({ pinUrl: offPin.toDataURL('image/png'), bleedUrl: offBleed.toDataURL('image/png') })
  }

  const handleReset = () => {
    if (!imgRef.current) return
    const scale = Math.max(DISPLAY_INNER / imgRef.current.width, DISPLAY_INNER / imgRef.current.height)
    setZoom(scale)
    setOffset({ x: 0, y: 0 })
  }

  const eyedropperBtnStyle = {
    background: 'var(--surface3)', border: '1px solid var(--border)',
    borderRadius: 5, padding: '3px 7px', cursor: 'pointer',
    color: 'var(--text-muted)', fontSize: 15, lineHeight: 1,
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div className="cropper-overlay z-10000" onClick={handleOverlayClick}>
      <div className="cropper-panel">

        {/* ── LEFT COLUMN: Canvas & Zoom ──────────────── */}
        <div className="cropper-left">
          <div className="cropper-canvas-wrap">
            <canvas
              ref={canvasRef}
              width={DISPLAY_SIZE}
              height={DISPLAY_SIZE}
              className="cropper-canvas"
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

          <div className="zoom-row w-full mt-1">
            <ZoomOut size={16} />
            <Slider min={5} max={2000} step={1}
              value={[Math.round(zoom * 100)]}
              onValueChange={([v]) => setZoom(v / 100)}
              className="zoom-slider"
            />
            <ZoomIn size={16} />
            <span className="zoom-label">{Math.round(zoom * 100)}%</span>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Info, Options & Actions ────── */}
        <div className="cropper-right">
          <div>
            <div className="cropper-header">
              <CircleDashed size={18} />
              <span>Recortar — ⌀{pinDiamMm}mm · sangría visible</span>
            </div>
          </div>

          <div className="cropper-controls-scroll">
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
    </div>
  )
}
