import { AppShell } from '@/components/layout/app-shell';
import { SectionTabs } from '@/components/ui/section-tabs';
import { NotificationList } from '@/components/notifications/notification-list';
import { NotificationSettings } from '@/components/notifications/notification-settings';
import { getNotifications } from '@/lib/api/notifications';
import { getLiveCount } from '@/lib/api/matches';
import { siteConfig } from '@/config/site';

export const metadata = { title: `Notificaciones · ${siteConfig.name}` };

export default async function NotificationsPage() {
  const [items, liveCount] = await Promise.all([getNotifications(), getLiveCount()]);
  const unread = items.filter((n) => !n.read).length;

  return (
    <AppShell active="notificaciones" counts={{ live: liveCount }}>
      <div className="flex max-w-2xl flex-col gap-5">
        <h1 className="text-[26px] font-black tracking-tight">Notificaciones</h1>
        <SectionTabs
          label="Notificaciones"
          items={[
            { value: 'inbox', label: unread ? `Recientes · ${unread}` : 'Recientes', content: <NotificationList items={items} /> },
            { value: 'settings', label: 'Ajustes', content: <NotificationSettings /> },
          ]}
        />
      </div>
    </AppShell>
  );
}
