import { AppShell } from '@/components/layout/app-shell';
import { SectionTabs } from '@/components/ui/section-tabs';
import { NotificationInbox } from '@/components/notifications/notification-inbox';
import { NotificationSettings } from '@/components/notifications/notification-settings';
import { getLiveCount } from '@/lib/api/matches';
import { siteConfig } from '@/config/site';

export const metadata = { title: `Notificaciones · ${siteConfig.name}` };

export default async function NotificationsPage() {
  const liveCount = await getLiveCount();
  return (
    <AppShell active="notificaciones" counts={{ live: liveCount }}>
      <div className="flex max-w-2xl flex-col gap-5">
        <h1 className="text-[26px] font-black tracking-tight">Notificaciones</h1>
        <SectionTabs
          label="Notificaciones"
          items={[
            { value: 'inbox', label: 'Recientes', content: <NotificationInbox /> },
            { value: 'settings', label: 'Ajustes', content: <NotificationSettings /> },
          ]}
        />
      </div>
    </AppShell>
  );
}
