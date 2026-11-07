import Link from 'next/link';
import { NAV_ITEMS } from '@/config/navigation';
import { cx } from '@/lib/utils/cx';
import styles from './BottomNav.module.css';

export default function BottomNav({ active }) {
  return (
    <nav className={styles.bar} aria-label="Navegación inferior">
      {NAV_ITEMS.filter((i) => i.mobile).map((item) => {
        const on = item.id === active || (active === 'en-vivo' && item.id === 'partidos');
        return (
          <Link key={item.id} href={item.href} className={cx(styles.item, on && styles.active)} aria-current={on ? 'page' : undefined}>
            <span className={styles.dot} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
