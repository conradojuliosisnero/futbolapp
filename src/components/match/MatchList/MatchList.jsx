import { SectionHeader, Eyebrow, Stack } from '@/components/ui';
import MatchRow from '../MatchRow';

export default function MatchList({ title, date, groups, highlightId }) {
  return (
    <Stack as="section" gap={5}>
      <SectionHeader title={title} meta={date} />
      {groups.map((g) => (
        <Stack key={g.league} gap={2}>
          <Eyebrow>{g.league}</Eyebrow>
          {g.matches.map((m) => <MatchRow key={m.id} match={m} highlighted={m.id === highlightId} />)}
        </Stack>
      ))}
    </Stack>
  );
}
