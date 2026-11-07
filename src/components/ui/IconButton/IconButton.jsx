import { cx } from '@/lib/utils/cx';
import styles from './IconButton.module.css';

/** shape: 'circle' | 'rounded' · tone: 'surface' | 'scrim' */
export default function IconButton({ label, shape = 'circle', tone = 'surface', active, className, children, ...rest }) {
  return (
    <button type="button" aria-label={label} className={cx(styles.btn, styles[shape], styles[tone], active && styles.active, className)} {...rest}>
      {children}
    </button>
  );
}
