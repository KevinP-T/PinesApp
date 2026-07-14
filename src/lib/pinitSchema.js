import { z } from 'zod'

// Versión actual del formato de datos de Pinit.
export const CURRENT_VERSION = 2

// Un slot de imagen es: null (vacío) o un data URL (imagen embebida).
// Se RECHAZA explícitamente cualquier string que empiece con 'blob:'
// para proteger contra URLs de objeto muertas (revocadas / sin resolver).
const imageSlot = z.union([z.null(), z.string().startsWith('data:')])

// Esquema de un archivo .pinit en su forma V2.
export const PinitV2 = z.object({
  version: z.literal(2),
  config: z.object({
    pinDiamMm: z.number().min(10).max(120),
    bleedMm: z.number().min(0).max(20),
    gridCols: z.number().int().min(1).max(6),
    gridRows: z.number().int().min(1).max(8),
    gapXMm: z.number().min(10).max(200),
    gapYMm: z.number().min(10).max(200),
    unit: z.enum(['mm', 'in']).default('mm'),
    sheet: z.enum(['A4', 'A3']).default('A4'),
    bleedMode: z.enum(['3mm', '6mm']).default('3mm'),
  }),
  pins: z.array(imageSlot),
  bleedImages: z.array(imageSlot),
  originals: z.array(imageSlot),
  exportedAt: z.number(),
})

export default PinitV2
