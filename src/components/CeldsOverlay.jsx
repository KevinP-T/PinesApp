export default function CeldsOverlay({ positions, radius, w, h }) {
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
