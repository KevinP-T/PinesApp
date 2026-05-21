import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Slider } from "@/components/ui/slider"
import {
  Upload, ZoomIn, ZoomOut, RotateCcw, Check,
  Download, Trash2, Move, CircleDashed, Eye, EyeOff, Edit, PencilIcon, ShareIcon, TrashIcon, X, Square, Minus
} from "lucide-react"
import './App.css'

// ─── Exact measurements from Krita templates ──────────────────────────────
// cut_55_2026.kra  → 840×840px at 300dpi
// a4_pin_55_2026.kra → 2480×3508px at 300dpi = 210×297mm A4
const DPI = 300
const MM_TO_PX = DPI / 25.4            // 11.811 px/mm
const A4_W_MM = 210
const A4_H_MM = 297
const A4_W_PX = 2480                    // exact Krita canvas
const A4_H_PX = 3508
const PIN_DIAM_MM = 60
const PIN_RADIUS_MM = PIN_DIAM_MM / 2
const PIN_RADIUS_PX_300 = PIN_RADIUS_MM * MM_TO_PX  // 324.8px — export resolution

// Pin centers from Krita layer analysis (as fraction of A4)
// Grid: left→right, top→bottom, 3 cols × 4 rows = 12 slots
const PIN_FRACTIONS = [
  [0.17, 0.14], [0.5, 0.14], [0.83, 0.14],
  [0.17, 0.38], [0.5, 0.38], [0.83, 0.38],
  [0.17, 0.62], [0.5, 0.62], [0.83, 0.62],
  [0.17, 0.86], [0.5, 0.86], [0.83, 0.86],
]
const TOTAL_PINS = 12

// ─── PinCropper ────────────────────────────────────────────────────────────
function PinCropper({ imageSrc, onConfirm, onCancel }) {
  const DISPLAY_SIZE = 520   // screen px for preview
  const EXPORT_SIZE = Math.round(PIN_RADIUS_PX_300 * 2)  // ~649px at 300dpi

  const canvasRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imgRef = useRef(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    if (!imageSrc) return

    const img = new Image()

    img.onload = () => {
      imgRef.current = img

      const scale = Math.max(
        DISPLAY_SIZE / img.width,
        DISPLAY_SIZE / img.height
      )

      setZoom(scale)
      setOffset({ x: 0, y: 0 })
      setImgLoaded(true)
    }

    img.src = imageSrc
  }, [imageSrc])

  useEffect(() => { if (imgLoaded) draw() }, [zoom, offset, imgLoaded])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas || !imgRef.current) return
    const ctx = canvas.getContext('2d')
    const img = imgRef.current
    const S = DISPLAY_SIZE
    const R = S / 2

    ctx.clearRect(0, 0, S, S)

    // Clip to circle, draw image
    ctx.save()
    ctx.beginPath()
    ctx.arc(R, R, R, 0, Math.PI * 2)
    ctx.clip()
    const w = img.width * zoom
    const h = img.height * zoom
    ctx.drawImage(img, R - w / 2 + offset.x, R - h / 2 + offset.y, w, h)
    ctx.restore()

    // Gold circle border
    ctx.beginPath()
    ctx.arc(R, R, R - 1, 0, Math.PI * 2)
    ctx.strokeStyle = '#e2c97e'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  const onMouseDown = (e) => { setDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }) }
  const onMouseMove = (e) => { if (!dragging) return; setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }) }
  const onMouseUp = () => setDragging(false)
  const onWheel = (e) => { e.preventDefault(); setZoom(z => Math.max(0.05, Math.min(10, z * (1 - e.deltaY * 0.001)))) }

  const handleConfirm = () => {
    const off = document.createElement('canvas')
    off.width = EXPORT_SIZE
    off.height = EXPORT_SIZE
    const ctx = off.getContext('2d')
    const img = imgRef.current
    const R = EXPORT_SIZE / 2
    const scale = EXPORT_SIZE / DISPLAY_SIZE

    ctx.save()
    ctx.beginPath()
    ctx.arc(R, R, R, 0, Math.PI * 2)
    ctx.clip()
    const w = img.width * zoom * scale
    const h = img.height * zoom * scale
    ctx.drawImage(img, R - w / 2 + offset.x * scale, R - h / 2 + offset.y * scale, w, h)
    ctx.restore()

    onConfirm(off.toDataURL('image/png'))
  }

  const handleReset = () => {
    if (!imgRef.current) return
    const scale = Math.max(DISPLAY_SIZE / imgRef.current.width, DISPLAY_SIZE / imgRef.current.height)
    setZoom(scale); setOffset({ x: 0, y: 0 })
  }

  return (
    <div className="cropper-overlay">
      <div className="cropper-panel flex flex-col justify-between">
        <div className="cropper-header">
          <CircleDashed size={18} />
          <span>Recortar — ⌀{PIN_DIAM_MM}mm pin</span>
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
function PinSlot({ index, imageData, isSelected, menuOpen, onClick, onEdit, onRemove, onDrop, displayRadius, outerBleed }) {
  const [dragOver, setDragOver] = useState(false)
  const size = displayRadius * 2

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)
  const onDrop_ = (e) => {
    e.preventDefault(); setDragOver(false)
    const idx = e.dataTransfer.getData('pin-index')
    if (idx !== '') onDrop(parseInt(idx))
  }

  return (
    // 1. EL CONTENEDOR PADRE NO LLEVA LA CLASE "pin-slot"
    <div style={{ position: 'relative', width: size, height: size }}>

      {/* 2. CÍRCULO EXTERIOR ESTÁTICO */}
      {/* Al estar afuera del div "pin-slot", nunca se va a agrandar con el hover */}
      <div
        style={{
          position: 'absolute',
          top: -outerBleed,
          left: -outerBleed,
          right: -outerBleed,
          bottom: -outerBleed,
          borderRadius: '50%',
          backgroundColor: '#fbfafb',
          border: '1px solid #d4d4d4',
          zIndex: 0,
          pointerEvents: 'none' /* El mouse lo traspasa como un fantasma */
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
  const [pins, setPins] = useState(Array(TOTAL_PINS).fill(null))
  const [originals, setOriginals] = useState(Array(TOTAL_PINS).fill(null))  // imagen original sin recortar
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [cropTarget, setCropTarget] = useState(null)
  const [menuSlotIndex, setMenuSlotIndex] = useState(null)
  const fileInputRef = useRef(null)

  // A4 display: 500px wide → 710px tall
  const A4_DISPLAY_W = 500
  const A4_DISPLAY_H = Math.round(A4_DISPLAY_W * (A4_H_MM / A4_W_MM))
  const DISPLAY_SCALE = A4_DISPLAY_W / A4_W_MM      // px/mm on screen
  const PIN_DISPLAY_RADIUS = Math.round(PIN_RADIUS_MM * DISPLAY_SCALE)

  const BLEED_MM = 4.2333 // Elegí acá cuántos milímetros extra querés que tenga el borde
  const BLEED_PX = Math.round(BLEED_MM * DISPLAY_SCALE) // Lo convierte a píxeles exactos

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

  const handleCropConfirm = (dataUrl) => {
    setPins(prev => { const n = [...prev]; n[cropTarget.slotIndex] = dataUrl; return n })
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

    // Calculamos la escala para impresión (píxeles por milímetro a 300 DPI)
    // Asegurate de tener definida BLEED_MM y A4_W_MM fuera de esta función (ej: const BLEED_MM = 3)
    const EXPORT_SCALE = A4_W_PX / A4_W_MM
    const BLEED_PX_EXPORT = Math.round(BLEED_MM * EXPORT_SCALE)

    await Promise.all(
      PIN_FRACTIONS.map(([fx, fy], idx) => new Promise(resolve => {
        if (!pins[idx]) { resolve(); return }
        const img = new Image()
        img.onload = () => {
          const cx = Math.round(fx * A4_W_PX)
          const cy = Math.round(fy * A4_H_PX)
          const r = Math.round(PIN_RADIUS_PX_300)

          // Calculamos el radio del círculo exterior
          const outerR = r + BLEED_PX_EXPORT

          // --- 1. DIBUJAMOS EL CÍRCULO EXTERIOR GRIS (Base/Sangrado) ---
          ctx.beginPath()
          ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
          ctx.fillStyle = '#fbfafb' // Mismo fondo gris de la pantalla
          ctx.fill()

          ctx.lineWidth = 2 // Grosor del borde ajustado para que se vea bien en 300 DPI
          ctx.strokeStyle = '#d4d4d4' // Mismo color de borde
          ctx.stroke()
          // -------------------------------------------------------------

          // --- 2. DIBUJAMOS LA IMAGEN DEL PIN (Recortada) ---
          ctx.save()
          ctx.beginPath()
          ctx.arc(cx, cy, r, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2)
          ctx.restore()

          resolve()
        }
        img.src = pins[idx]
      }))
    )

    const link = document.createElement('a')
    link.download = `pines_a4_300dpi_${Date.now().toString()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const filledCount = pins.filter(Boolean).length

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
      <div className="absolute bottom-30 right-21">
        <div className="section-label">ESPECIFICACIONES</div>
        <div className="spec-row"><span>Hoja</span><span>A4 {A4_W_MM}×{A4_H_MM}mm</span></div>
        <div className="spec-row"><span>Resolución </span><span>300 DPI</span></div>
        <div className="spec-row"><span>Pin ⌀</span><span>{PIN_DIAM_MM}mm</span></div>
        <div className="spec-row"><span>Output </span><span>2480×3508px</span></div>
      </div>

      <header className="tittle-bar flex justify-between z-1 border-b-2 p-1">
        <div>
          hola soy un software de pines
        </div>
        <ButtonGroup className="windows-button bg-scroll z-90 ">
          <Button variant="outline" className="px-2! py-2!" onClick={() => window.ipcRenderer.minimize()}><Minus /></Button>
          <Button variant="outline" className="px-2! py-2!" onClick={() => window.ipcRenderer.toggleMaximize()}><Square /></Button>
          <Button variant="outline" className="px-2! py-2!" onClick={() => window.ipcRenderer.close()}><X className="text-red-600" /></Button>
        </ButtonGroup>

      </header>
      <div className="flex w-screen">
        <div>
        </div>
        <div className="w-screen">
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
                      outerBleed={BLEED_PX}

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
                  <Button className="btn-ghost-muted" size="sm" onClick={() => setUpdateState(null)}>
                    Ahora no
                  </Button>
                  <Button className="btn-gold" size="sm" onClick={() => {
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
                  <Button className="btn-ghost-muted px-2! py-1!" size="sm" onClick={() => setUpdateState(null)}>
                    Más tarde
                  </Button>
                  <Button className="btn-gold px-2! py-1!" size="sm" onClick={() => {
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