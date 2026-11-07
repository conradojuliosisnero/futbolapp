import { cx } from '@/lib/utils/cx';
import Sidebar from '../Sidebar';
import BottomNav from '../BottomNav';
import styles from './AppShell.module.css';

/**
 * Estructura responsive:
 *  < 768   una columna + BottomNav
 *  768+    Sidebar compacta (iconos), aside debajo del contenido
 *  1200+   Sidebar completa | contenido | aside fijo
 */
export default function AppShell({ active, counts = {}, aside, asideWide = false, children }) {
  return (
    <div className={cx(styles.shell, asideWide && styles.wide)}>
      <Sidebar active={active} counts={counts} />
      <main className={styles.main}>{children}</main>
      {aside && <aside className={styles.aside}>{aside}</aside>}
      <BottomNav active={active} />
    </div>
  );
}
