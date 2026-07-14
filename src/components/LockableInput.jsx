import { Link2, Unlink2, Lock, Unlock } from "lucide-react"

export default function LockableInput({ label, value, inputValue, onChange, min, max, step, unit, linked, onLinkToggle, linkedLabel, frozen, onFreezeToggle }) {
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
