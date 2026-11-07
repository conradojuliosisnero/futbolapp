import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { AdminGate, AdminReady } from '@/components/admin/admin-gate';
import { currentUser, isAdmin } from '@/lib/firebase/server-session';
import { adminDb } from '@/lib/firebase/admin';
import { adminData } from '@/lib/usage/admin-data';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';

// Panel solo para la cuenta de ADMIN_EMAIL. A cualquier otra cuenta se le responde 404 (no se revela que existe).
export const metadata = { title: `Admin · ${siteConfig.name}`, robots: { index: false, follow: false } };

const fmtDate = (t) => (t ? new Intl.DateTimeFormat('es', { timeZone: siteConfig.timeZone, day: 'numeric', month: 'short', year: '2-digit' }).format(t) : '—');
const fmtAgo = (t) => {
  if (!t) return '—';
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 60) return `hace ${Math.max(1, m)} min`;
  if (m < 1440) return `hace ${Math.round(m / 60)} h`;
  return `hace ${Math.round(m / 1440)} d`;
};
const short = (day) => day.slice(8) + '/' + day.slice(5, 7);

function Stat({ label, value, hint }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-card p-4">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="text-2xl font-black tabular-nums">{value}</span>
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </div>
  );
}

/** Barras de peticiones por día (con sesión / sin sesión). */
function DailyChart({ totals }) {
  const max = Math.max(1, ...totals.map((t) => t.total));
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">Peticiones por día</h2>
        <span className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><i className="size-2.5 rounded-sm bg-primary" />con sesión</span>
          <span className="flex items-center gap-1"><i className="size-2.5 rounded-sm bg-subtle/50" />sin sesión</span>
        </span>
      </div>
      <div className="flex h-40 items-end gap-1.5">
        {totals.map((t) => (
          <div key={t.day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${t.day}: ${t.total} peticiones · ${t.users} usuarios`}>
            <span className="text-[10px] font-bold text-muted-foreground tabular-nums">{t.total || ''}</span>
            <div className="flex w-full flex-col overflow-hidden rounded-md" style={{ height: `${(t.total / max) * 100}%` }}>
              <div className="bg-subtle/50" style={{ flex: t.anon }} />
              <div className="bg-primary" style={{ flex: t.total - t.anon }} />
            </div>
            <span className="text-[10px] text-faint tabular-nums">{short(t.day)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spark({ values }) {
  const max = Math.max(1, ...values);
  return (
    <span className="flex h-6 items-end gap-0.5" aria-hidden>
      {values.map((v, i) => <i key={i} className={cn('w-1.5 rounded-sm', v ? 'bg-primary' : 'bg-secondary')} style={{ height: `${Math.max(12, (v / max) * 100)}%` }} />)}
    </span>
  );
}

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) return <AppShell active="admin"><AdminGate /></AppShell>;
  if (!isAdmin(user)) notFound();
  if (!adminDb()) return <AppShell active="admin"><p className="p-8">Falta FIREBASE_SERVICE_ACCOUNT en el servidor.</p></AppShell>;

  const { days, totals, users, newThisWeek } = await adminData({ days: 14 });
  const today = totals.at(-1);
  const week = days.slice(-7);

  return (
    <AppShell active="admin">
      <AdminReady />
      <div className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-[26px] font-black tracking-tight">Panel de admin</h1>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Usuarios" value={users.length} hint={`${newThisWeek} nuevos en 7 días`} />
          <Stat label="Activos hoy" value={today.users} hint={`${users.filter((u) => u.week > 0).length} en 7 días`} />
          <Stat label="Peticiones hoy" value={today.total} hint={`${today.anon} sin sesión`} />
          <Stat label="Peticiones 14 días" value={totals.reduce((n, t) => n + t.total, 0)} />
        </div>

        <DailyChart totals={totals} />

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-bold">Usuarios <span className="font-normal text-muted-foreground">· peticiones al servidor (hoy / 7 días / 14 días)</span></h2>
          <div className="overflow-x-auto rounded-2xl bg-card">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-3 py-3 font-semibold">Últimos 7 días</th>
                  <th className="px-3 py-3 text-right font-semibold">Hoy</th>
                  <th className="px-3 py-3 text-right font-semibold">7 d</th>
                  <th className="px-3 py-3 text-right font-semibold">14 d</th>
                  <th className="px-3 py-3 text-right font-semibold">Puntos</th>
                  <th className="px-3 py-3 font-semibold">Última vez</th>
                  <th className="px-3 py-3 font-semibold">Alta</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.uid} className="border-b last:border-0 align-middle">
                    <td className="px-4 py-2.5">
                      <details>
                        <summary className="flex cursor-pointer list-none items-center gap-2.5">
                          {u.photo
                            // eslint-disable-next-line @next/next/no-img-element -- foto del usuario
                            ? <img src={u.photo} alt="" referrerPolicy="no-referrer" className="size-8 rounded-full object-cover" />
                            : <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-bold">{(u.name || u.email)[0]?.toUpperCase()}</span>}
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate font-semibold">{u.name || '—'}</span>
                            <span className="truncate text-xs text-muted-foreground">{u.email} · {u.provider}</span>
                          </span>
                        </summary>
                        <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px]">
                          {days.map((d) => (
                            <span key={d} className="rounded-md bg-secondary px-1 py-0.5">
                              <span className="block text-faint">{short(d)}</span><b className="tabular-nums">{u.perDay[d]}</b>
                            </span>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">Racha {u.streak} · {u.favorites} favoritos · {u.leagues} ligas · uid {u.uid}</p>
                      </details>
                    </td>
                    <td className="px-3 py-2.5"><Spark values={week.map((d) => u.perDay[d])} /></td>
                    <td className="px-3 py-2.5 text-right font-bold tabular-nums">{u.today}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{u.week}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{u.total}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{u.points}</td>
                    <td className="px-3 py-2.5 text-xs whitespace-nowrap text-muted-foreground">{fmtAgo(u.lastSeen)}</td>
                    <td className="px-3 py-2.5 text-xs whitespace-nowrap text-muted-foreground">{fmtDate(u.created)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-faint">Cuenta páginas, navegación dentro de la app y llamadas a /api (sin archivos estáticos ni precargas). Días en hora de Colombia.</p>
        </section>
      </div>
    </AppShell>
  );
}
