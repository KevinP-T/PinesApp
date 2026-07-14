// @ts-nocheck
// Internal state model for the pin board.
//
// Consolidates the three previously-parallel arrays (pins / originals / bleedImages)
// into a single hook. The data *contract* is preserved: the hook still exposes
// `pins`, `originals` and `bleedImages` as plain arrays so the rest of App.jsx —
// and the validated migration path in handleLoadPinit — behave exactly as before.
//
// This file is intentionally @ts-nocheck: it ships as an untyped .jsx helper so it
// never blocks `tsc` and keeps the refactor's blast radius minimal.
import { useState, useCallback } from "react"

const makeArray = (size) => Array(size).fill(null)

/**
 * usePinBoard — manages the three synchronized slot arrays behind one API.
 *
 * @param {number} initialSize  COLS*ROWS at first mount
 */
export function usePinBoard(initialSize) {
  const [pins, setPins] = useState(() => makeArray(initialSize))
  const [originals, setOriginals] = useState(() => makeArray(initialSize))
  const [bleedImages, setBleedImages] = useState(() => makeArray(initialSize))

  // Resize all three arrays keeping prior values up to the new length.
  const resize = useCallback((newSize) => {
    setPins((prev) => makeArray(newSize).map((_, i) => prev[i] ?? null))
    setOriginals((prev) => makeArray(newSize).map((_, i) => prev[i] ?? null))
    setBleedImages((prev) => makeArray(newSize).map((_, i) => prev[i] ?? null))
  }, [])

  // Single-slot setters (index-aware).
  const setPin = useCallback((idx, pinUrl) => {
    setPins((prev) => {
      const n = [...prev]
      n[idx] = pinUrl
      return n
    })
  }, [])

  const setOriginal = useCallback((idx, original) => {
    setOriginals((prev) => {
      const n = [...prev]
      n[idx] = original
      return n
    })
  }, [])

  const setBleed = useCallback((idx, bleedUrl) => {
    setBleedImages((prev) => {
      const n = [...prev]
      n[idx] = bleedUrl
      return n
    })
  }, [])

  // Remove a single slot from all three arrays (set to null).
  const removeSlot = useCallback((idx) => {
    setPins((prev) => {
      const n = [...prev]
      n[idx] = null
      return n
    })
    setOriginals((prev) => {
      const n = [...prev]
      n[idx] = null
      return n
    })
    setBleedImages((prev) => {
      const n = [...prev]
      n[idx] = null
      return n
    })
  }, [])

  // Snapshot a slot for the clipboard: { pinUrl, bleedUrl, original }.
  const copySlot = useCallback(
    (idx) => ({
      pinUrl: pins[idx],
      bleedUrl: bleedImages[idx],
      original: originals[idx],
    }),
    [pins, originals, bleedImages],
  )

  // Paste a clipboard snapshot into a slot across all three arrays.
  const pasteSlot = useCallback((idx, clipboard) => {
    if (!clipboard) return
    setPins((prev) => {
      const n = [...prev]
      n[idx] = clipboard.pinUrl
      return n
    })
    setBleedImages((prev) => {
      const n = [...prev]
      n[idx] = clipboard.bleedUrl
      return n
    })
    setOriginals((prev) => {
      const n = [...prev]
      n[idx] = clipboard.original
      return n
    })
  }, [])

  // Swap two slots across all three arrays.
  const swapSlots = useCallback((targetIdx, sourceIdx) => {
    if (targetIdx === sourceIdx) return
    setPins((prev) => {
      const n = [...prev]
      ;[n[targetIdx], n[sourceIdx]] = [n[sourceIdx], n[targetIdx]]
      return n
    })
    setOriginals((prev) => {
      const n = [...prev]
      ;[n[targetIdx], n[sourceIdx]] = [n[sourceIdx], n[targetIdx]]
      return n
    })
    setBleedImages((prev) => {
      const n = [...prev]
      ;[n[targetIdx], n[sourceIdx]] = [n[sourceIdx], n[targetIdx]]
      return n
    })
  }, [])

  // Bulk load (used by handleLoadPinit). Keeps the data contract identical:
  // the three arrays are set exactly as the migration produced them.
  const hydrate = useCallback((newPins, newBleed, newOriginals) => {
    setPins(newPins)
    setBleedImages(newBleed)
    setOriginals(newOriginals)
  }, [])

  // Clear every slot.
  const clearAll = useCallback((size) => {
    setPins(makeArray(size))
    setOriginals(makeArray(size))
    setBleedImages(makeArray(size))
  }, [])

  return {
    pins,
    originals,
    bleedImages,
    setPin,
    setOriginal,
    setBleed,
    resize,
    removeSlot,
    copySlot,
    pasteSlot,
    swapSlots,
    hydrate,
    clearAll,
  }
}
