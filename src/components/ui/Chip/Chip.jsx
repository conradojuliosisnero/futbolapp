import { cx } from '@/lib/utils/cx';
import styles from './Chip.module.css';

export default function Chip({ active, count, children, ...rest }) {
  return (
    <button type="button" aria-pressed={!!active} className={cx(styles.chip, active && styles.active)} {...rest}>
      {children}{count != null && <span> · {count}</span>}
    </button>
  );
}
