/**
 * Barra proporcional segmentada.
 * segments: [{ value: 61, tone: 'primary' | 'neutral-1' | 'neutral-2' }]
 */
export function SplitBar({ segments, height = 6 }) {
  return (
    <div className="flex origin-left gap-[3px] overflow-hidden rounded-full animate-in fade-in-0 slide-in-from-left-4 duration-700 ease-out motion-reduce:animate-none" style={{ height }}>
      {segments.map((s, i) => (
        <div key={i} className="min-w-0.5 transition-[flex-grow] duration-700 ease-out" style={{ flex: s.value, background: `var(--${s.tone ?? 'primary'})` }} />
      ))}
    </div>
  );
}
