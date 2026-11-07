import Link from 'next/link';

export function SectionHeader({ title, meta, action }) {
  const metaCls = 'text-md font-medium text-subtle';
  return (
    <header className="flex items-baseline justify-between gap-3">
      <h2 className="text-xl font-extrabold">{title}</h2>
      {action
        ? <Link href={action.href} className={metaCls}>{action.label}</Link>
        : meta && <span className={metaCls}>{meta}</span>}
    </header>
  );
}
