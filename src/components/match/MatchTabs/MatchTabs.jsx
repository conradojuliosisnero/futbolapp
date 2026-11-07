'use client';

import { useState } from 'react';
import { Tabs, Stack } from '@/components/ui';
import Timeline from '../Timeline';
import StatsList from '../StatsList';
import Lineups from '../Lineups';

const TABS = [
  { id: 'events', label: 'Jugadas' },
  { id: 'stats', label: 'Estadísticas' },
  { id: 'lineups', label: 'Alineación' },
];

export default function MatchTabs({ match, defaultTab = 'events' }) {
  const [tab, setTab] = useState(defaultTab);
  return (
    <Stack gap={4}>
      <Tabs items={TABS} value={tab} onChange={setTab} label="Detalle del partido" />
      <div role="tabpanel">
        {tab === 'events' && <Timeline events={match.events} />}
        {tab === 'stats' && <StatsList stats={match.stats} />}
        {tab === 'lineups' && <Lineups match={match} />}
      </div>
    </Stack>
  );
}
