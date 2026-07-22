import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Download, Trash2, ZoomIn, ZoomOut, RotateCcw, Check,
  Save, FolderOpen, ChevronDown, Minus, Square, X, HelpCircle,
  RefreshCw, CheckCircle, AlertCircle
} from "lucide-react"
import './App.css'
import PinitIcon from './assets/PinitIcon.ico'

// ─── Modular components & helpers ──────────────────────────────────────────
import {
  DPI, MM_TO_PX, A4_W_MM, A4_H_MM, A4_W_PX, A4_H_PX,
  A3_W_MM, A3_H_MM, SHEETS,
  DEFAULT_PIN_DIAM_MM, DEFAULT_BLEED_MM, DEFAULT_COLS, DEFAULT_ROWS,
  DEFAULT_GAP_X_MM, DEFAULT_GAP_Y_MM,
  calcExportConstants, calcPinFractions, calcCapacity,
  AR_DIAMETER_PRESETS, AR_BLEED_PRESETS
} from "./lib/canvasHelpers"

import LockableInput from "./components/LockableInput"
import CeldsOverlay from "./components/CeldsOverlay"
import PinSlot from "./components/PinSlot"
import PinCropper from "./components/PinCropper"

// ─── Data migration (V1 → V2) ───────────────────────────────────────────────
import {
  migratePinitV1toV2, sanitizeBlobs, repairArrays, isFutureVersion,
  migrateTemplateV1toV2,
} from './lib/migration'
import { PinitV2 } from './lib/pinitSchema'

// ─── Internal board state (consolidated slot model) ─────────────────────────
import { usePinBoard } from './lib/usePinBoard'

export default function App() {
  // Three parallel arrays (pins / originals / bleedImages) are managed inside the
  // hook but exposed as plain arrays so the rest of the component — and the
  // validated migration path — is unchanged.
  const { pins, originals, bleedImages, setPin, setOriginal, setBleed, resize, removeSlot, copySlot, pasteSlot, swapSlots, hydrate, clearAll } = usePinBoard(DEFAULT_COLS * DEFAULT_ROWS)

  const [selectedSlot, setSelectedSlot] = useState(null)
  const [cropTarget, setCropTarget] = useState(null)
  const [menuSlotIndex, setMenuSlotIndex] = useState(null)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [activeTemplateName, setActiveTemplateName] = useState(null)
  const fileInputRef = useRef(null)
  const pinitFileInputRef = useRef(null)

  // ── Config ────────────────────────────────────────────────────────────
  const [pinDiamMm, setPinDiamMm] = useState(DEFAULT_PIN_DIAM_MM)
  const [bleedMm, setBleedMm] = useState(DEFAULT_BLEED_MM)
  const [pinDiamInput, setPinDiamInput] = useState(String(DEFAULT_PIN_DIAM_MM))
  const [bleedInput, setBleedInput] = useState(String(DEFAULT_BLEED_MM))

  // ── Unit / sheet / bleed mode (V2 config fields) ───────────────────────
  const [unit, setUnit] = useState('mm')
  const [sheet, setSheet] = useState('A4')
  const [bleedMode, setBleedMode] = useState('3mm')

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
        if (saved) setTemplates(saved.map(t => migrateTemplateV1toV2(t)).filter(t => t && t.pinDiamMm !== undefined))
      } catch (_) {
        // fallback: localStorage
        try {
          const raw = localStorage.getItem('pinit-templates')
          if (raw) setTemplates(JSON.parse(raw).map(t => migrateTemplateV1toV2(t)).filter(t => t && t.pinDiamMm !== undefined))
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

  const PIN_FRACTIONS = calcPinFractions(gridCols, gridRows, gapXMm, gapYMm, sheet)
  const TOTAL_PINS = gridCols * gridRows

  // ── Display-only unit conversion (mm → inches) ──────────────────────────
  // Internally everything stays in mm; only the *label* is converted.
  const toDisplayMm = (vMm) =>
    unit === 'in' ? (vMm / 25.4).toFixed(2) + '"' : vMm + ' mm'

  // Live capacity counter for the chosen sheet.
  const liveCapacity = calcCapacity(pinDiamMm, bleedMm, sheet)
  const { pinRadiusMm: PIN_RADIUS_MM, pinRadiusPx300: PIN_RADIUS_PX_300, exportRadiusPx: EXPORT_RADIUS_PX } = calcExportConstants(pinDiamMm, bleedMm)

  const pinDisplayPositions = PIN_FRACTIONS.map(([fx, fy]) => ({
    x: Math.round(fx * A4_DISPLAY_W),
    y: Math.round(fy * A4_DISPLAY_H),
  }))

  // ── Handlers ──────────────────────────────────────────────────────────
  const handlePinDiamChange = (val) => {
    if (pinDiamFrozen) return
    setPinDiamInput(val)
    const parsed = parseFloat(val)
    if (!isNaN(parsed)) {
      const mm = unit === 'in' ? parsed * 25.4 : parsed
      if (mm >= 10 && mm <= 120) {
        setPinDiamMm(mm)
        if (pinBleedLocked) {
          // keep bleed ratio
          const ratio = bleedMm / pinDiamMm
          const newBleed = parseFloat((mm * ratio).toFixed(2))
          setBleedMm(newBleed)
          setBleedInput(unit === 'in' ? (newBleed / 25.4).toFixed(2) : String(newBleed))
        }
      }
    }
  }

  const handleBleedChange = (val) => {
    if (bleedFrozen) return
    setBleedInput(val)
    const parsed = parseFloat(val)
    if (!isNaN(parsed)) {
      const mm = unit === 'in' ? parsed * 25.4 : parsed
      if (mm >= 0 && mm <= 20) setBleedMm(mm)
    }
  }

  // ── AR diameter presets ──────────────────────────────────────────────
  const applyDiameterPreset = (preset) => {
    if (pinDiamFrozen) return
    setPinDiamMm(preset.mm)
    setPinDiamInput(unit === 'in' ? (preset.mm / 25.4).toFixed(2) : String(preset.mm))
    // 'large' (56 mm) stays editable so the user can tweak 55/58 to match their machine.
  }

  // ── AR bleed quick toggle (3 mm / 6 mm) ──────────────────────────────
  const applyBleedPreset = (mm) => {
    if (bleedFrozen) return
    setBleedMm(mm)
    setBleedInput(unit === 'in' ? (mm / 25.4).toFixed(2) : String(mm))
    // keep schema v2 bleedMode coherent when saving
    const bm = Math.abs(mm - 3) < 1 ? '3mm' : Math.abs(mm - 6) < 1 ? '6mm' : '3mm'
    setBleedMode(bm)
  }

  // ── Unit selector (with mathematical conversion) ──────────────────────
  const handleSetUnit = (newUnit) => {
    if (newUnit === unit) return
    setUnit(newUnit)
    if (newUnit === 'in') {
      setPinDiamInput((pinDiamMm / 25.4).toFixed(2))
      setBleedInput((bleedMm / 25.4).toFixed(2))
      setGapXInput((gapXMm / 25.4).toFixed(2))
      setGapYInput((gapYMm / 25.4).toFixed(2))
    } else {
      setPinDiamInput(String(parseFloat(pinDiamMm.toFixed(2))))
      setBleedInput(String(parseFloat(bleedMm.toFixed(2))))
      setGapXInput(String(parseFloat(gapXMm.toFixed(2))))
      setGapYInput(String(parseFloat(gapYMm.toFixed(2))))
    }
  }

  // ── Reset sidebar values back to factory defaults ───────────────────
  const resetConfiguration = () => {
    setPinDiamMm(DEFAULT_PIN_DIAM_MM)
    setBleedMm(DEFAULT_BLEED_MM)
    setGridCols(DEFAULT_COLS)
    setGridRows(DEFAULT_ROWS)
    setGapXMm(DEFAULT_GAP_X_MM)
    setGapYMm(DEFAULT_GAP_Y_MM)

    setUnit('mm')
    setPinDiamInput(String(DEFAULT_PIN_DIAM_MM))
    setBleedInput(String(DEFAULT_BLEED_MM))
    setColsInput(String(DEFAULT_COLS))
    setRowsInput(String(DEFAULT_ROWS))
    setGapXInput(String(DEFAULT_GAP_X_MM))
    setGapYInput(String(DEFAULT_GAP_Y_MM))

    setSheet('A4')
    setBleedMode('3mm')
    setGapLocked(false)
    setPinBleedLocked(false)
    setPinDiamFrozen(false)
    setBleedFrozen(false)
    setGapXFrozen(false)
    setGapYFrozen(false)
    setA4Zoom(1.0)
    setActiveTemplateName(null)

    resize(DEFAULT_COLS * DEFAULT_ROWS)
  }

  // ── Sheet selector (A4 / A3) ─────────────────────────────────────────
  const selectSheet = (s) => setSheet(s)

  const handleColsChange = (val) => {
    setColsInput(val)
    const n = parseInt(val)
    if (!isNaN(n) && n >= 1 && n <= 6) {
      setGridCols(n)
      resize(n * gridRows)
    }
  }

  const handleRowsChange = (val) => {
    setRowsInput(val)
    const n = parseInt(val)
    if (!isNaN(n) && n >= 1 && n <= 8) {
      setGridRows(n)
      resize(gridCols * n)
    }
  }

  const handleGapXChange = (val) => {
    if (gapXFrozen) return
    setGapXInput(val)
    const parsed = parseFloat(val)
    if (!isNaN(parsed)) {
      const mm = unit === 'in' ? parsed * 25.4 : parsed
      if (mm >= 10 && mm <= 200) {
        setGapXMm(mm)
        if (gapLocked) {
          const ratio = gapYMm / gapXMm
          const newY = parseFloat((mm * ratio).toFixed(2))
          setGapYMm(newY)
          setGapYInput(unit === 'in' ? (newY / 25.4).toFixed(2) : String(newY))
        }
      }
    }
  }

  const handleGapYChange = (val) => {
    if (gapYFrozen) return
    setGapYInput(val)
    const parsed = parseFloat(val)
    if (!isNaN(parsed)) {
      const mm = unit === 'in' ? parsed * 25.4 : parsed
      if (mm >= 10 && mm <= 200) {
        setGapYMm(mm)
        if (gapLocked) {
          const ratio = gapXMm / gapYMm
          const newX = parseFloat((mm * ratio).toFixed(2))
          setGapXMm(newX)
          setGapXInput(unit === 'in' ? (newX / 25.4).toFixed(2) : String(newX))
        }
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
    removeSlot(idx)
    if (selectedSlot === idx) setSelectedSlot(null)
  }

  const handleCopyPin = (idx) => {
    if (!pins[idx]) return
    setPinClipboard(copySlot(idx))
  }

  const handlePastePin = (idx) => {
    if (!pinClipboard) return
    pasteSlot(idx, pinClipboard)
    setSelectedSlot(null)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      setOriginal(selectedSlot, dataUrl)
      setCropTarget({ imageSrc: dataUrl, slotIndex: selectedSlot })
    }
    reader.readAsDataURL(file)
  }

  const handleCropConfirm = ({ pinUrl, bleedUrl }) => {
    setPin(cropTarget.slotIndex, pinUrl)
    setBleed(cropTarget.slotIndex, bleedUrl)
    setSelectedSlot(null)
    setCropTarget(null)
  }

  const handleSlotDrop = (targetIdx, sourceIdx) => {
    if (sourceIdx === targetIdx) return
    swapSlots(targetIdx, sourceIdx)
  }

  // ── Clipboard paste ────────────────────────────────────────────────────
  const handleImageFromClipboard = useCallback((url) => {
    const targetSlot = selectedSlot !== null ? selectedSlot : pins.findIndex(p => p === null)
    if (targetSlot === -1) return
    setSelectedSlot(targetSlot)
    setOriginal(targetSlot, url)
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
          const reader = new FileReader()
          reader.onload = () => {
            const dataUrl = reader.result
            handleImageFromClipboard(dataUrl)
          }
          reader.readAsDataURL(file)
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
    pinDiamMm, bleedMm, gridCols, gridRows, gapXMm, gapYMm,
    unit, sheet, bleedMode,
  })

  const saveTemplate = async () => {
    const name = templateName.trim() || `Plantilla ${templates.length + 1}`
    const tpl = { name, ...currentConfig(), createdAt: Date.now() }
    const updated = [...templates.filter(t => t.name !== name), tpl]
    setTemplates(updated)
    setTemplateName('')
    setActiveTemplateName(name)
    try {
      await window.ipcRenderer.invoke('templates:save', updated)
    } catch (_) {
      localStorage.setItem('pinit-templates', JSON.stringify(updated))
    }
  }

  const loadTemplate = (tpl) => {
    const t = migrateTemplateV1toV2(tpl)
    const activeUnit = t.unit || 'mm'
    setUnit(activeUnit)
    setPinDiamMm(t.pinDiamMm)
    setPinDiamInput(activeUnit === 'in' ? (t.pinDiamMm / 25.4).toFixed(2) : String(t.pinDiamMm))
    setBleedMm(t.bleedMm)
    setBleedInput(activeUnit === 'in' ? (t.bleedMm / 25.4).toFixed(2) : String(t.bleedMm))
    setGridCols(t.gridCols); setColsInput(String(t.gridCols))
    setGridRows(t.gridRows); setRowsInput(String(t.gridRows))
    setGapXMm(t.gapXMm)
    setGapXInput(activeUnit === 'in' ? (t.gapXMm / 25.4).toFixed(2) : String(t.gapXMm))
    setGapYMm(t.gapYMm)
    setGapYInput(activeUnit === 'in' ? (t.gapYMm / 25.4).toFixed(2) : String(t.gapYMm))
    if (t.sheet) setSheet(t.sheet)
    if (t.bleedMode) setBleedMode(t.bleedMode)
    // NOTE: images are preserved intentionally — only config changes
    setShowTemplateDD(false)
    if (t.name) {
      setTemplateToast(t.name)
      setActiveTemplateName(t.name)
      setTimeout(() => setTemplateToast(null), 2500)
    }
  }

  const deleteTemplate = async (name) => {
    if (!confirm(`¿Estás seguro de que querés borrar la plantilla "${name}"?`)) return
    if (activeTemplateName === name) {
      setActiveTemplateName(null)
    }
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
            // ✅ Aplicar clip circular antes de dibujar
            ctx.save()
            ctx.beginPath()
            ctx.arc(cx, cy, r + overlap, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(pinImg, cx - r - overlap, cy - r - overlap, (r + overlap) * 2, (r + overlap) * 2)
            ctx.restore()
            // El borde va fuera del clip
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
            // ✅ Clip circular para el bleed también
            ctx.save()
            ctx.beginPath()
            ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(bleedImg, cx - outerR, cy - outerR, outerR * 2, outerR * 2)
            ctx.restore()
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
      version: 2,
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
        let data = JSON.parse(ev.target.result)

        // Versión futura: no tocar nada, preservar estado actual.
        if (isFutureVersion(data)) {
          setTemplateToast('Versión de Pinit más nueva; actualizá la app')
          setTimeout(() => setTemplateToast(null), 3000)
          return
        }

        // Migrar V1 → V2 si hace falta.
        if ((data.version ?? 1) < 2) {
          data = migratePinitV1toV2(data)
        }

        // Sanitizar blob: muertos → null en los 3 arrays.
        data = sanitizeBlobs(data)

        // Validar contra el esquema V2.
        let res = PinitV2.safeParse(data)
        if (!res.success) {
          data = repairArrays(data)
          res = PinitV2.safeParse(data)
        }
        if (!res.success) {
          alert('No se pudo validar el archivo .pinit')
          return
        }

        const cfg = res.data.config
        const activeUnit = cfg.unit || 'mm'
        setUnit(activeUnit)
        setPinDiamMm(cfg.pinDiamMm)
        setPinDiamInput(activeUnit === 'in' ? (cfg.pinDiamMm / 25.4).toFixed(2) : String(cfg.pinDiamMm))
        setBleedMm(cfg.bleedMm)
        setBleedInput(activeUnit === 'in' ? (cfg.bleedMm / 25.4).toFixed(2) : String(cfg.bleedMm))
        setGridCols(cfg.gridCols); setColsInput(String(cfg.gridCols))
        setGridRows(cfg.gridRows); setRowsInput(String(cfg.gridRows))
        setGapXMm(cfg.gapXMm)
        setGapXInput(activeUnit === 'in' ? (cfg.gapXMm / 25.4).toFixed(2) : String(cfg.gapXMm))
        setGapYMm(cfg.gapYMm)
        setGapYInput(activeUnit === 'in' ? (cfg.gapYMm / 25.4).toFixed(2) : String(cfg.gapYMm))
        if (cfg.sheet) setSheet(cfg.sheet)
        if (cfg.bleedMode) setBleedMode(cfg.bleedMode)

        // Restaurar imágenes del propio archivo .pinit.
        hydrate(res.data.pins, res.data.bleedImages, res.data.originals)
        const name = file.name.replace(/\.pinit$/, '')
        setTemplateToast(name)
        setActiveTemplateName(name)
        setTimeout(() => setTemplateToast(null), 2500)
      } catch (_) {
        alert('No se pudo cargar el archivo .pinit')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── Updates ────────────────────────────────────────────────────────────
  const [updateState, setUpdateState] = useState(null)  // null | 'available' | 'downloading' | 'error'
  const [updateVersion, setUpdateVersion] = useState('')
  const [updateProgress, setUpdateProgress] = useState(0)
  const [updateStatus, setUpdateStatus] = useState('')
  const updateUserAccepted = useRef(false)

  useEffect(() => {
    window.ipcRenderer.on('update-available', (_, version) => {
      setUpdateVersion(version)
      setUpdateState('available')
    })
    window.ipcRenderer.on('update-progress', (_, percent) => {
      if (!updateUserAccepted.current) return
      setUpdateState('downloading')
      setUpdateProgress(percent)
    })
    window.ipcRenderer.on('update-downloaded', () => {
      if (updateUserAccepted.current) {
        window.ipcRenderer.send('update:install')
      } else {
        setUpdateState(null)  // ← limpiar el modal si nadie pidió la descarga
      }
    })
    // Mensajes de estado / errores visibles (incluye 'La app está al día' y 'Error: ...').
    window.ipcRenderer.on('update-status', (_, msg) => {
      if (!msg) return
      if (msg.startsWith('Error:')) {
        setUpdateStatus(msg)
        setUpdateState('error')
      } else if (msg === 'La app está al día') {
        // No mostramos el modal si ya está al día.
        setUpdateState(null)
      } else {
        // Otro estado informativo: mostrarlo si el modal está abierto.
        setUpdateStatus(msg)
      }
    })
    return () => {
      window.ipcRenderer.removeAllListeners('update-available')
      window.ipcRenderer.removeAllListeners('update-progress')
      window.ipcRenderer.removeAllListeners('update-downloaded')
      window.ipcRenderer.removeAllListeners('update-status')
    }
  }, [])

  // ── Modals Keyboard Shortcuts (Escape key) ──────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showHelpModal) {
          setShowHelpModal(false)
        } else if (updateState && updateState !== 'downloading') {
          setUpdateState(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showHelpModal, updateState])

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
      <header className="tittle-bar flex justify-between items-center z-1">
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
        <aside className="sidebar" style={{ padding: '12px 12px' }}>
          {sectionLabel('CONFIGURACIÓN')}

          {/* Tarjeta 1: Plantillas */}
          <div className="sidebar-card" ref={templateDDRef}>
            <div className="sidebar-card-title flex justify-between items-center w-full">
              <span>PLANTILLAS</span>
              {activeTemplateName && (
                <span style={{ 
                  fontSize: '11px', 
                  color: 'var(--gold)', 
                  background: 'rgba(226, 201, 126, 0.1)', 
                  border: '1px solid rgba(226, 201, 126, 0.2)',
                  padding: '3px 8px', 
                  borderRadius: '5px',
                  textTransform: 'none',
                  letterSpacing: '0',
                  fontWeight: '500',
                  maxWidth: '140px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }} title={`Plantilla activa: ${activeTemplateName}`}>
                  {activeTemplateName}
                </span>
              )}
            </div>
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
            <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
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
            {/* Clear Template / Reset Sidebar button */}
            <button
              onClick={resetConfiguration}
              title="Limpiar plantilla actual y restablecer valores de la sidebar a los de fábrica"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                background: 'var(--surface3)',
                border: '1px solid var(--border)',
                borderRadius: 5,
                color: 'var(--text-muted)',
                padding: '5px 8px',
                fontSize: 11,
                cursor: 'pointer',
                marginTop: 2,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <RotateCcw size={12} />
              <span>Limpiar / Restablecer</span>
            </button>
          </div>

          {/* Tarjeta 2: Configuración de Lienzo */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">AJUSTES DE LIENZO</div>
            
            {/* Unidad de medida */}
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 4 }}>UNIDAD DE MEDIDA</div>
              <div style={{ display: 'flex', background: 'var(--surface3)', padding: 2, borderRadius: 5, border: '1px solid var(--border)' }}>
                <button
                  onClick={() => handleSetUnit('mm')}
                  style={{
                    flex: 1,
                    background: unit === 'mm' ? 'var(--gold)' : 'transparent',
                    color: unit === 'mm' ? '#1a1a1a' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 0',
                    fontSize: 11,
                    fontWeight: unit === 'mm' ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  mm
                </button>
                <button
                  onClick={() => handleSetUnit('in')}
                  style={{
                    flex: 1,
                    background: unit === 'in' ? 'var(--gold)' : 'transparent',
                    color: unit === 'in' ? '#1a1a1a' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 0',
                    fontSize: 11,
                    fontWeight: unit === 'in' ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  in
                </button>
              </div>
            </div>

            {/* Tamaño de hoja */}
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 4 }}>TAMAÑO DE HOJA</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['A4', 'A3'].map(s => {
                  const active = s === sheet
                  return (
                    <button key={s} onClick={() => selectSheet(s)}
                      style={{
                        flex: 1,
                        background: active ? 'var(--gold)' : 'var(--surface3)',
                        border: '1px solid var(--border)',
                        borderRadius: 5,
                        color: active ? '#1a1a1a' : 'var(--text)',
                        padding: '5px 8px',
                        fontSize: 12,
                        fontWeight: active ? '600' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Capacidad Badge */}
            <div className="capacity-badge">
              Caben <b style={{ color: 'var(--gold)' }}>{liveCapacity.total}</b> pines ({liveCapacity.cols}×{liveCapacity.rows}) en {sheet}
            </div>
          </div>

          {/* Tarjeta 3: Dimensiones del Pin */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">MEDIDAS DEL PIN</div>
            
            {/* Pin diameter */}
            <LockableInput
              label="TAMAÑO DEL PIN"
              value={unit === 'in' ? pinDiamMm / 25.4 : pinDiamMm}
              inputValue={pinDiamInput}
              onChange={handlePinDiamChange}
              min={unit === 'in' ? 10 / 25.4 : 10}
              max={unit === 'in' ? 120 / 25.4 : 120}
              step={unit === 'in' ? 0.05 : 0.5}
              unit={unit === 'in' ? 'in' : 'mm'}
              linked={pinBleedLocked} onLinkToggle={() => setPinBleedLocked(v => !v)}
              linkedLabel="sangría"
              frozen={pinDiamFrozen} onFreezeToggle={() => setPinDiamFrozen(v => !v)}
            />

            {/* AR diameter presets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: -4 }}>
              {AR_DIAMETER_PRESETS.map(preset => {
                const commonlyUsed = [25, 32, 44, 58].includes(preset.mm)
                const active = Math.abs(preset.mm - pinDiamMm) < 0.001
                return (
                  <button key={preset.mm}
                    onClick={() => applyDiameterPreset(preset)}
                    disabled={pinDiamFrozen}
                    title={preset.label}
                    style={{
                      background: active ? 'var(--gold)' : 'var(--surface3)',
                      border: '1px solid var(--border)', borderRadius: 5,
                      color: active ? '#1a1a1a' : 'var(--text)',
                      padding: '3px 6px', fontSize: 10, cursor: 'pointer',
                      opacity: pinDiamFrozen ? 0.5 : 1,
                    }}>
                    {preset.label.replace(/ \(editable[^)]*\)/, '')}{commonlyUsed ? ' ★' : ''}
                  </button>
                )
              })}
            </div>

            {/* Bleed */}
            <LockableInput
              label="SANGRÍA (BORDE EXTRA)"
              value={unit === 'in' ? bleedMm / 25.4 : bleedMm}
              inputValue={bleedInput}
              onChange={handleBleedChange}
              min={0}
              max={unit === 'in' ? 20 / 25.4 : 20}
              step={unit === 'in' ? 0.01 : 0.1}
              unit={unit === 'in' ? 'in' : 'mm'}
              frozen={bleedFrozen} onFreezeToggle={() => setBleedFrozen(v => !v)}
            />

            {/* AR bleed quick toggle (3 mm / 6 mm) */}
            <div style={{ display: 'flex', gap: 4, marginTop: -4 }}>
              {AR_BLEED_PRESETS.map(preset => {
                const active = Math.abs(preset.mm - bleedMm) < 0.001
                return (
                  <button key={preset.mm}
                    onClick={() => applyBleedPreset(preset.mm)}
                    disabled={bleedFrozen}
                    title={preset.label}
                    style={{
                      flex: 1, background: active ? 'var(--gold)' : 'var(--surface3)',
                      border: '1px solid var(--border)', borderRadius: 5,
                      color: active ? '#1a1a1a' : 'var(--text)',
                      padding: '4px 6px', fontSize: 11, cursor: 'pointer',
                      opacity: bleedFrozen ? 0.5 : 1,
                    }}>
                    {preset.mm} mm
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tarjeta 4: Distribución en Grilla */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">DISTRIBUCIÓN Y GRILLA</div>
            
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

            {/* Gap X */}
            <LockableInput
              label="SEPARACIÓN HORIZONTAL"
              value={unit === 'in' ? gapXMm / 25.4 : gapXMm}
              inputValue={gapXInput}
              onChange={handleGapXChange}
              min={unit === 'in' ? 10 / 25.4 : 10}
              max={unit === 'in' ? 200 / 25.4 : 200}
              step={unit === 'in' ? 0.05 : 0.5}
              unit={unit === 'in' ? 'in' : 'mm'}
              linked={gapLocked} onLinkToggle={() => setGapLocked(v => !v)}
              linkedLabel="vertical"
              frozen={gapXFrozen} onFreezeToggle={() => setGapXFrozen(v => !v)}
            />

            {/* Gap Y */}
            <LockableInput
              label="SEPARACIÓN VERTICAL"
              value={unit === 'in' ? gapYMm / 25.4 : gapYMm}
              inputValue={gapYInput}
              onChange={handleGapYChange}
              min={unit === 'in' ? 10 / 25.4 : 10}
              max={unit === 'in' ? 200 / 25.4 : 200}
              step={unit === 'in' ? 0.05 : 0.5}
              unit={unit === 'in' ? 'in' : 'mm'}
              frozen={gapYFrozen} onFreezeToggle={() => setGapYFrozen(v => !v)}
            />
          </div>

          {/* Tarjeta 5: Acciones de Exportación */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">ACCIONES</div>
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
                onClick={() => { if (confirm('¿Limpiar todos los slots?')) { clearAll(TOTAL_PINS) } }}
                disabled={filledCount === 0}
              >
                <Trash2 size={14} /> Limpiar todo
              </Button>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <main className="main-area flex-1 flex flex-col overflow-hidden" style={{ padding: 0 }}>

            {/* Top bar: progress + zoom controls */}
            <div className="canvas-top-bar">
              {/* Progreso */}
              <div className="top-bar-progress">
                <div className="progress-header">
                  <span className="progress-title">Progreso</span>
                  <span className="progress-text">{filledCount} / {TOTAL_PINS} pines</span>
                </div>
                <div className="progress-bar-wrap" style={{ height: 6 }}>
                  <div className="progress-bar" style={{ width: `${(filledCount / TOTAL_PINS) * 100}%` }} />
                </div>
              </div>

              {/* Indicación de Slot Seleccionado */}
              <div className="top-bar-hint">
                <div className={`hint-badge ${selectedSlot !== null ? 'selected' : ''}`}>
                  {selectedSlot !== null ? (
                    <>
                      <span style={{ color: 'var(--gold)' }}>●</span>
                      <span>Slot {selectedSlot + 1} seleccionado · Ctrl+V para pegar</span>
                    </>
                  ) : (
                    <span>Click en un slot para seleccionarlo · Doble click para editar/cargar</span>
                  )}
                </div>
              </div>

              {/* Controles de Zoom */}
              <div className="top-bar-zoom">
                <div className="zoom-hint-tag">
                  <span>Zoom</span>
                  <span style={{ color: 'var(--text-muted)' }}>(Ctrl + rueda)</span>
                </div>
                <button className="zoom-btn" onClick={() => setA4Zoom(z => Math.max(0.3, z - 0.1))} title="Zoom Out">
                  <ZoomOut size={13} />
                </button>
                <span className="zoom-value">{Math.round(a4Zoom * 100)}%</span>
                <button className="zoom-btn" onClick={() => setA4Zoom(z => Math.min(3, z + 0.1))} title="Zoom In">
                  <ZoomIn size={13} />
                </button>
                <button className="zoom-btn" onClick={() => setA4Zoom(1.0)} title="Restablecer zoom">
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
                position: 'relative',
              }}
              className="min-w-[80vw]"
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedSlot(null) }}
            >
              {/* Floating Specifications Panel */}
              <div 
                className="specs-panel"
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  zIndex: 40,
                  background: 'rgba(28, 28, 28, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  width: 170,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>ESPECIFICACIONES</div>
                  <div className="specs-box" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 10 }}>
                      <span>Hoja</span>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{sheet} {SHEETS[sheet].w}×{SHEETS[sheet].h}mm</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 10 }}>
                      <span>Resolución</span>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>300 DPI</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 10 }}>
                      <span>Output</span>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{sheet === 'A3' ? '3508×4961px' : '2480×3508px'}</span>
                    </div>
                  </div>
                </div>

                {/* Help button nested here with pointer-events auto */}
                <button 
                  onClick={() => setShowHelpModal(true)}
                  style={{
                    pointerEvents: 'auto',
                    width: '100%',
                    background: 'var(--surface3)',
                    border: '1px solid var(--border)',
                    borderRadius: 5,
                    color: 'var(--text)',
                    padding: '5px 8px',
                    fontSize: 10,
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--gold)';
                    e.currentTarget.style.color = '#1a1a1a';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--surface3)';
                    e.currentTarget.style.color = 'var(--text)';
                  }}
                >
                  <HelpCircle size={12} />
                  <span>Guía y Accesos</span>
                </button>
              </div>
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
      {/* Help Modal */}
      {showHelpModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHelpModal(false)
          }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
            pointerEvents: 'all',
          }}
        >
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--gold)', borderRadius: 14,
            padding: '24px 28px', maxWidth: 500, width: '90%', display: 'flex', flexDirection: 'column', gap: 18,
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: 'var(--gold)', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 8 }}>
                <HelpCircle size={20} />
                <span>GUÍA DE USO Y SHORTCUTS</span>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <X size={18} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: '60vh', paddingRight: 4 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: '1.4' }}>
                PINIT automatiza el armado de hojas para pines. A continuación, las interacciones más útiles disponibles:
              </div>
              
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 12, marginBottom: 4 }}>🖱️ INTERACCIONES DE TABLERO</div>
                <ul style={{ listStyleType: 'disc', paddingLeft: 16, fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li><b>Click en slot</b>: Selecciona el slot para copiar, pegar o eliminar.</li>
                  <li><b>Doble click en slot con imagen</b>: Abre el editor de recorte circular (Cropper).</li>
                  <li><b>Doble click en slot vacío</b>: Abre el explorador de archivos para cargar una imagen.</li>
                  <li><b>Arrastrar y Soltar (Drag & Drop)</b>: Intercambia de lugar los pines en el tablero.</li>
                  <li><b>Click derecho</b>: Selecciona el slot y despliega la barra flotante de opciones (Copiar, Pegar, Eliminar, Cargar).</li>
                </ul>
              </div>

              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 12, marginBottom: 4 }}>⌨️ SHORTCUTS / ACCESOS RÁPIDOS</div>
                <ul style={{ listStyleType: 'disc', paddingLeft: 16, fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li><b>Ctrl + V (Pegar)</b>: Pega una imagen directamente desde tu portapapeles en el slot seleccionado (o en el primero vacío).</li>
                  <li><b>Ctrl + Rueda del mouse</b>: Realiza zoom dinámico y suave en la hoja A4/A3.</li>
                  <li><b>Ctrl + R</b>: Recarga la aplicación por completo.</li>
                </ul>
              </div>

              <div>
                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 12, marginBottom: 4 }}>📌 CONSEJO DE SANGRE (BLEED)</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Usa <b>3 mm</b> para stickers o resinas normales, y <b>6 mm</b> para pines de metal/plástico envueltos (button) para garantizar que la imagen envuelva el contorno del pin sin bordes blancos.
                </div>
              </div>
            </div>

            <Button className="btn-gold w-full mt-2" size="sm" onClick={() => setShowHelpModal(false)}>
              Entendido
            </Button>
          </div>
        </div>
      )}

      {updateState && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Actualización de la aplicación"
          onClick={(e) => {
            if (e.target === e.currentTarget && updateState !== 'downloading') {
              setUpdateState(null)
            }
          }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
            // Bloquear interacción con la app durante la descarga
            pointerEvents: 'all',
          }}
        >
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--gold)', borderRadius: 14,
            padding: '28px 32px', minWidth: 380, maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          }}>
            {/* Encabezado con icono según estado */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: updateState === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(212,175,55,0.15)',
                color: updateState === 'error' ? '#ef4444' : 'var(--gold)',
              }}>
                {updateState === 'available' && <Download size={22} />}
                {updateState === 'downloading' && <RefreshCw size={22} />}
                {updateState === 'error' && <AlertCircle size={22} />}
              </div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--gold)', letterSpacing: '0.08em' }}>
                {updateState === 'available' && 'NUEVA VERSIÓN DISPONIBLE'}
                {updateState === 'downloading' && 'DESCARGANDO ACTUALIZACIÓN'}
                {updateState === 'error' && 'ERROR DE ACTUALIZACIÓN'}
              </div>
            </div>

            {/* Cuerpo */}
            <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.45 }}>
              {updateState === 'available' && (
                <>
                  Hay una versión más reciente lista para instalar.
                  <div style={{
                    marginTop: 10, padding: '8px 12px', borderRadius: 8,
                    background: 'var(--surface3)', border: '1px solid var(--border)',
                    color: 'var(--text)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <CheckCircle size={16} color="var(--gold)" />
                    <span>Versión <b style={{ color: 'var(--gold)' }}>{updateVersion}</b> disponible</span>
                  </div>
                </>
              )}
              {updateState === 'downloading' && 'La app se va a reiniciar automáticamente cuando termine la descarga.'}
              {updateState === 'error' && (
                <span style={{ color: '#fca5a5' }}>{updateStatus || 'Ocurrió un error al buscar o descargar la actualización.'}</span>
              )}
            </div>

            {/* Barra de progreso (solo en descarga) */}
            {updateState === 'downloading' && (
              <div>
                <div style={{ height: 8, background: 'var(--surface3)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: 'var(--gold)', width: `${updateProgress}%`, transition: 'width 0.3s ease' }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--gold)', textAlign: 'right', marginTop: 6, fontWeight: 600 }}>{updateProgress}%</div>
              </div>
            )}

            {/* Acciones */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              {updateState === 'available' && (
                <>
                  <Button className="btn-ghost-muted px-2! py-3!" size="sm" onClick={() => setUpdateState(null)}>Ahora no</Button>
                  <Button autoFocus className="btn-gold px-2! py-3!" size="sm" onClick={() => {
                    updateUserAccepted.current = true
                    window.ipcRenderer.send('update:user-accepted')
                    window.ipcRenderer.send('update:start-download')
                    setUpdateState('downloading')
                  }}>Descargar e instalar</Button>
                </>
              )}
              {updateState === 'downloading' && (
                <Button className="btn-ghost-muted" size="sm" disabled>Descargando... {updateProgress}%</Button>
              )}
              {updateState === 'error' && (
                <Button className="btn-gold px-2! py-3!" size="sm" onClick={() => setUpdateState(null)}>Cerrar</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}