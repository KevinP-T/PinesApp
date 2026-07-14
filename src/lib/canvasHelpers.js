// ─── Exact measurements from Krita templates ──────────────────────────────
export const DPI = 300;
export const MM_TO_PX = DPI / 25.4;
export const A4_W_MM = 210;
export const A4_H_MM = 297;
export const A4_W_PX = 2480;
export const A4_H_PX = 3508;

// ─── A3 sheet (297 × 420 mm) ─────────────────────────────────────────────
export const A3_W_MM = 297;
export const A3_H_MM = 420;

// Sheet index: grilla de posiciones parametrizable por hoja.
export const SHEETS = {
  A4: { w: A4_W_MM, h: A4_H_MM },
  A3: { w: A3_W_MM, h: A3_H_MM },
};

export const DEFAULT_PIN_DIAM_MM = 59;
export const DEFAULT_BLEED_MM = 4.3;

export function calcExportConstants(pinDiamMm, bleedMm) {
  const pinRadiusMm = pinDiamMm / 2;
  const pinRadiusPx300 = pinRadiusMm * MM_TO_PX;
  const bleedPx300 = bleedMm * MM_TO_PX;
  const exportRadiusPx = Math.round(pinRadiusPx300 + bleedPx300);
  return { pinRadiusMm, pinRadiusPx300, bleedPx300, exportRadiusPx };
}

export const DEFAULT_COLS = 3;
export const DEFAULT_ROWS = 4;
export const DEFAULT_GAP_X_MM = 69.5;
export const DEFAULT_GAP_Y_MM = 69.5;

export function calcPinFractions(cols, rows, gapXMm, gapYMm, sheet = 'A4') {
  // Resuelve la hoja: string → SHEETS[...], objeto {w,h} → usarlo, undefined/defecto → A4.
  const s = typeof sheet === 'string' ? SHEETS[sheet] : sheet;
  const sheetW = s ? s.w : A4_W_MM;
  const sheetH = s ? s.h : A4_H_MM;
  const totalW = (cols - 1) * gapXMm;
  const totalH = (rows - 1) * gapYMm;
  const startX = (sheetW - totalW) / 2;
  const startY = (sheetH - totalH) / 2;
  const fracs = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      fracs.push([
        (startX + c * gapXMm) / sheetW,
        (startY + r * gapYMm) / sheetH,
      ]);
    }
  }
  return fracs;
}

// Wrapper claro: centra la grilla en la hoja pedida (string o {w,h}).
export function calcPinFractionsFor(sheet, cols, rows, gapXMm, gapYMm) {
  return calcPinFractions(cols, rows, gapXMm, gapYMm, sheet);
}

// ─── Capacidad por hoja (contador en vivo de la UI) ──────────────────────
// Replica las tablas del informe AR.
export function calcCapacity(pinDiamMm, bleedMm, sheet = 'A4') {
  const tile = pinDiamMm + 2 * bleedMm;
  const s = typeof sheet === 'string' ? SHEETS[sheet] : sheet;
  const margin = 5; // mm de margen de impresora
  const usableW = s.w - 2 * margin;
  const usableH = s.h - 2 * margin;
  const cols = Math.floor(usableW / tile);
  const rows = Math.floor(usableH / tile);
  return { cols, rows, total: cols * rows, tile };
}

// ─── Presets AR (UI) ─────────────────────────────────────────────────────
export const AR_DIAMETER_PRESETS = [
  { mm: 25, label: '25 mm · 1"' },
  { mm: 32, label: '32 mm' },
  { mm: 38, label: '38 mm' },
  { mm: 44, label: '44 mm · 1¾"' },
  { mm: 56, label: '56 mm · 2¼" (editable 55–58)', large: true },
  { mm: 75, label: '75 mm · 3"' },
];

export const AR_BLEED_PRESETS = [
  { mm: 3, label: '3 mm (sticker/resina)' },
  { mm: 6, label: '6 mm (button envuelto)' },
];
