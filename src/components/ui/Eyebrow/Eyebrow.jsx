import { cx } from '@/lib/utils/cx';
import styles from './Eyebrow.module.css';

/** Etiqueta en mayúsculas. tone: 'muted' | 'accent' */
export default function Eyebrow({ tone = 'muted', children }) {
  return <div className={cx(styles.eyebrow, styles[tone])}>{children}</div>;
}
