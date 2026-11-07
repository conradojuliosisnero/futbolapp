import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { MatchRow } from './match-list';

/** Partidos agrupados por liga en acordeón (Animate UI). groups: [{ leagueId, league, matches }] */
export function MatchGroups({ groups, empty = 'No hay partidos.' }) {
  if (!groups.length) return <p className="py-6 text-center text-muted-foreground">{empty}</p>;
  return (
    <Accordion type="multiple" defaultValue={groups.map((g) => g.leagueId)} className="gap-2">
      {groups.map((g) => (
        <AccordionItem key={g.leagueId} value={g.leagueId} className="border-none">
          <AccordionTrigger className="items-center py-2 text-xs font-semibold tracking-wider text-faint uppercase hover:no-underline">
            <span>{g.league} <span className="text-subtle">· {g.matches.length}</span></span>
          </AccordionTrigger>
          <AccordionContent className="flex h-auto flex-col gap-2 pb-2 [&_a]:no-underline">
            {g.matches.map((m) => <MatchRow key={m.id} match={m} />)}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
