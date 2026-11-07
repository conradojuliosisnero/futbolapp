import Link from 'next/link';
import { cx } from '@/lib/utils/cx';
import styles from './Button.module.css';

/**
 * variant: 'primary' | 'secondary' | 'outline' | 'ghost'
 * size:    'md' | 'lg'
 * href:    si existe, renderiza un Link
 */
export default function Button({ variant = 'primary', size = 'md', href, fullWidth, className, children, ...rest }) {
  const cls = cx(styles.button, styles[variant], styles[size], fullWidth && styles.full, className);
  if (href) return <Link href={href} className={cls} {...rest}>{children}</Link>;
  return <button type="button" className={cls} {...rest}>{children}</button>;
}
