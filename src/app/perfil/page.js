import { AppShell } from '@/components/layout/app-shell';
import { ProfileCard } from '@/components/auth/profile-card';
import { PlaybackPrefs } from '@/components/moments/playback-prefs';
import { getLiveCount } from '@/lib/api/matches';
import { siteConfig } from '@/config/site';

export const metadata = { title: `Perfil · ${siteConfig.name}` };

export default async function ProfilePage() {
  const liveCount = await getLiveCount();
  return (
    <AppShell active="perfil" counts={{ live: liveCount }}>
      <div className="flex max-w-xl flex-col gap-4">
        <h1 className="text-[26px] font-black tracking-tight">Perfil</h1>
        <ProfileCard />
        <PlaybackPrefs />
      </div>
    </AppShell>
  );
}
