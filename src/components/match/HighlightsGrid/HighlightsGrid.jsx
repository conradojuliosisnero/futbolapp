import { SectionHeader, Stack } from '@/components/ui';
import HighlightCard from '../HighlightCard';
import styles from './HighlightsGrid.module.css';

export default function HighlightsGrid({ title, items, action = { href: '#', label: 'Ver todo' } }) {
  return (
    <Stack as="section" gap={4}>
      <SectionHeader title={title} action={action} />
      <div className={styles.grid}>
        {items.map((h) => <HighlightCard key={h.id} item={h} />)}
      </div>
    </Stack>
  );
}
