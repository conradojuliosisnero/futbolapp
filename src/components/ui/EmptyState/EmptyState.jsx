import Button from '../Button';
import styles from './EmptyState.module.css';

export default function EmptyState({ title, text, action }) {
  return (
    <main className={styles.wrap}>
      <h1 className={styles.title}>{title}</h1>
      {text && <p className={styles.text}>{text}</p>}
      {action && <Button href={action.href} size="lg">{action.label}</Button>}
    </main>
  );
}
