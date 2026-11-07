/**
 * Barra proporcional segmentada.
 * segments: [{ value: 61, tone: 'primary' | 'neutral-1' | 'neutral-2' }]
 */
export function SplitBar({ segments, height = 6 }) {
  return (
    <div className="flex gap-[3px] overflow-hidden rounded-full" style={{ height }}>
      {segments.map((s, i) => (
        <div key={i} className="min-w-0.5" style={{ flex: s.value, background: `var(--${s.tone ?? 'primary'})` }} />
      ))}
    </div>
  );
}
