import Link from 'next/link';
import { NAV_ITEMS, FOLLOWING } from '@/config/navigation';
import { Logo, CountBadge, TeamCrest, Eyebrow } from '@/components/ui';
import { InstallCard } from '@/components/pwa';
import { cx } from '@/lib/utils/cx';
import styles from './Sidebar.module.css';

export default function Sidebar({ active, counts = {} }) {
  return (
    <nav className={styles.sidebar} aria-label="Principal">
      <Link href="/" className={styles.logoFull}><Logo /></Link>
      <Link href="/" className={styles.logoMark} aria-label="Inicio"><Logo variant="mark" /></Link>

      <ul className={styles.menu}>
        {NAV_ITEMS.map((item) => {
          const on = item.id === active;
          return (
            <li key={item.id}>
              <Link href={item.href} className={cx(styles.item, on && styles.active)} aria-current={on ? 'page' : undefined} title={item.label}>
                <span className={styles.icon} aria-hidden>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
                {item.badgeKey && <span className={styles.badge}><CountBadge value={counts[item.badgeKey]} /></span>}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className={styles.following}>
        <div className={styles.heading}><Eyebrow>Siguiendo</Eyebrow></div>
        {FOLLOWING.map((f) => (
          <Link key={f.id} href={f.href} className={styles.follow}>
            <TeamCrest team={{ name: f.label }} size="sm" />{f.label}
          </Link>
        ))}
      </div>

      <div className={styles.install}><InstallCard /></div>
    </nav>
  );
}
