import { cx } from '@/lib/utils/cx';
import styles from './Media.module.css';

/** Imagen o placeholder rayado con etiqueta. ratio: '16/9' etc. */
export default function Media({ src, alt = '', label, ratio, rounded = 'none', className, children }) {
  const style = ratio ? { aspectRatio: ratio } : undefined;
  return (
    <div className={cx(styles.media, styles[`r-${rounded}`], className)} style={style}>
      {src ? <img src={src} alt={alt} className={styles.img} /> : label && <span className={styles.label}>{label}</span>}
      {children}
    </div>
  );
}
