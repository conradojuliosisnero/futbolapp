'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

/**
 * Pestañas del estilo de la app (indicador animado de Animate UI).
 * items: [{ value, label, content }] — content puede venir renderizado desde el servidor.
 */
export function SectionTabs({ items, defaultValue = items[0]?.value, label }) {
  return (
    <Tabs defaultValue={defaultValue} className="gap-4">
      <TabsList aria-label={label} className="h-auto! w-full rounded-2xl bg-card p-1">
        {items.map((t) => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            className="min-h-10 rounded-lg text-md font-semibold text-subtle data-active:font-bold dark:data-active:border-transparent dark:data-active:bg-accent"
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((t) => <TabsContent key={t.value} value={t.value}>{t.content}</TabsContent>)}
    </Tabs>
  );
}
