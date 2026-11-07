import styles from './Stack.module.css';

/** Contenedor flex vertical/horizontal con gap del token --pb-space-{gap} */
export default function Stack({ as: Tag = 'div', gap = 4, direction = 'column', align, justify, className = '', children, ...rest }) {
  return (
    <Tag
      className={`${styles.stack} ${className}`}
      style={{ gap: `var(--pb-space-${gap})`, flexDirection: direction, alignItems: align, justifyContent: justify }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
