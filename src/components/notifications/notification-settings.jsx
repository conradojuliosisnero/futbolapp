'use client';

import { useEffect, useState } from 'react';
import { BellRing } from '@/components/animate-ui/icons/bell-ring';
import { Smartphone } from '@/components/animate-ui/icons/smartphone';
import { Send } from '@/components/animate-ui/icons/send';
import { BellOff } from '@/components/animate-ui/icons/bell-off';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getPushState, subscribeToPush, unsubscribeFromPush, getCurrentSubscription, sendTestPush } from '@/lib/push';

const PREFS = [
  { id: 'goals', label: 'Goles', hint: 'De los partidos y equipos que sigues' },
  { id: 'kickoff', label: 'Inicio del partido', hint: 'Cuando ruede el balón' },
  { id: 'final', label: 'Resultado final', hint: 'Al terminar cada partido' },
  { id: 'redCards', label: 'Tarjetas rojas', hint: 'Expulsiones en vivo' },
  { id: 'reminders', label: 'Recordatorios', hint: 'Partidos que marcaste con "Recordar"' },
];
const DEFAULTS = { goals: true, kickoff: true, final: true, redCards: false, reminders: true };
// shortcut: preferencias en localStorage hasta tener login; luego van en users/{uid}.notify.
const KEY = 'futbolapp:notify';

const MESSAGES = {
  'ios-install': 'En iPhone las notificaciones solo funcionan con la app instalada: toca Compartir → "Agregar a inicio" y ábrela desde el ícono.',
  unsupported: 'Este navegador no soporta notificaciones push.',
  unconfigured: 'Faltan las claves VAPID en .env.local para activar el push.',
  denied: 'Bloqueaste las notificaciones. Actívalas en los ajustes del navegador para este sitio.',
};

function PushCard() {
  const [state, setState] = useState('loading');
  const [subscription, setSubscription] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // Depende del navegador: solo se puede leer después de hidratar.
    const s = getPushState();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única del navegador tras hidratar
    setState(s);
    if (s === 'granted') getCurrentSubscription().then(setSubscription);
  }, []);

  async function run(action, ok) {
    setBusy(true); setMsg('');
    try { await action(); setMsg(ok); }
    catch (e) { setMsg(e.message === 'permission-denied' ? MESSAGES.denied : 'Algo falló. Intenta de nuevo.'); }
    finally { setBusy(false); setState(getPushState()); }
  }

  const enable = () => run(async () => setSubscription(await subscribeToPush()), 'Listo: te avisaremos en este dispositivo.');
  const disable = () => run(async () => { await unsubscribeFromPush(); setSubscription(null); }, 'Desactivadas en este dispositivo.');
  const test = () => run(() => sendTestPush(subscription), 'Enviamos una notificación de prueba.');

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-card p-5">
      <div className="flex items-start gap-3.5">
        <span className="grid size-11 flex-none place-items-center rounded-full bg-primary text-primary-foreground"><Smartphone animateOnView className="size-5" aria-hidden /></span>
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-extrabold">Notificaciones push</h2>
          <p className="text-md text-muted-foreground">Avisos en tu celular o computador aunque la app esté cerrada.</p>
        </div>
      </div>

      {MESSAGES[state] && <p className="rounded-xl bg-secondary p-3 text-md text-muted-foreground">{MESSAGES[state]}</p>}

      {(state === 'default' || (state === 'granted' && !subscription)) && (
        <Button size="touch" onClick={enable} disabled={busy}><BellRing /> Activar notificaciones push</Button>
      )}
      {state === 'granted' && subscription && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="touch" onClick={test} disabled={busy} className="flex-1"><Send /> Enviar prueba</Button>
          <Button size="touch" variant="outline" onClick={disable} disabled={busy}><BellOff /> Desactivar</Button>
        </div>
      )}
      {msg && <p role="status" key={msg} className="text-md text-primary animate-in fade-in-0 slide-in-from-top-1 duration-300">{msg}</p>}
    </div>
  );
}

export function NotificationSettings() {
  const [prefs, setPrefs] = useState(DEFAULTS);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage solo existe tras hidratar
      if (saved) setPrefs({ ...DEFAULTS, ...saved });
    } catch { /* sin almacenamiento: quedan los valores por defecto */ }
  }, []);

  function toggle(id, value) {
    const next = { ...prefs, [id]: value };
    setPrefs(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* modo privado */ }
  }

  return (
    <div className="flex flex-col gap-4">
      <PushCard />
      <div className="flex flex-col rounded-3xl bg-card px-5">
        {PREFS.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-4 border-b py-4 last:border-b-0">
            <Label htmlFor={`pref-${p.id}`} className="flex flex-col items-start gap-1">
              <span className="text-sm font-bold">{p.label}</span>
              <span className="text-md font-normal text-muted-foreground">{p.hint}</span>
            </Label>
            <Switch id={`pref-${p.id}`} checked={prefs[p.id]} onCheckedChange={(v) => toggle(p.id, v)} />
          </div>
        ))}
      </div>
    </div>
  );
}
