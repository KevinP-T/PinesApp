import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Upload, Edit, TrashIcon, Copy, ClipboardPaste } from "lucide-react"

export default function PinSlot({ index, imageData, bleedUrl, isSelected, onClick, onEdit, onRemove, onUpload, onDrop, displayRadius, outerBleed, onCopy, onPaste, hasClipboard }) {
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
        onDoubleClick={imageData ? onEdit : onUpload}
        onContextMenu={(e) => {
          e.preventDefault()
          if (!isSelected) onClick()
        }}
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
