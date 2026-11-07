import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { safeCrest } from '@/lib/notify/look.mjs';

// Imagen grande de las notificaciones push (Android y Chrome de escritorio): el marcador con el estilo de Minuto 90.
// Todo viene en la URL (lo arma look.mjs); aquí se valida y se recorta. Los escudos solo de hosts conocidos.
// 1024×512 (proporción 2:1, la que usan Android y Chrome).

const C = { bg: '#0c0d0c', card: '#151714', text: '#f1f2ee', muted: '#9a9d93', lime: '#c6f432', limeText: '#0c0d0c', red: '#e8332b' };
// Sin emojis: el generador los descarga de un CDN y, si falla, se cae la imagen entera. Ícono dibujado con formas.
const KIND = {
  goal: { label: 'GOL', bg: C.lime, fg: C.limeText, dot: 'ball' },
  red: { label: 'ROJA', bg: C.red, fg: '#fff', dot: 'card' },
  kickoff: { label: 'EMPEZÓ', bg: C.text, fg: C.bg, dot: 'live' },
  final: { label: 'FINAL', bg: C.text, fg: C.bg, dot: null },
  test: { label: 'PRUEBA', bg: C.lime, fg: C.limeText, dot: 'ball' },
};

function Dot({ type, fg }) {
  if (type === 'card') return <span style={{ display: 'flex', width: 20, height: 28, borderRadius: 4, background: '#fff', marginRight: 12 }} />;
  if (type === 'live') return <span style={{ display: 'flex', width: 18, height: 18, borderRadius: 9, background: C.red, marginRight: 12 }} />;
  if (type === 'ball') return <span style={{ display: 'flex', width: 26, height: 26, borderRadius: 13, border: `5px solid ${fg}`, marginRight: 12 }} />;
  return null;
}
const clip = (v, n) => String(v ?? '').slice(0, n);

// Archivo (la fuente de la app, licencia OFL) en negrita, guardada en el proyecto: el generador no trae negritas
// y así no depende de descargarla. Ver outputFileTracingIncludes en next.config.mjs.
let fontsJob = null;
const loadFonts = () => (fontsJob ??= Promise.all([800, 900].map(async (weight) => ({
  name: 'Archivo', weight, style: 'normal',
  data: await readFile(join(process.cwd(), 'src/assets/fonts', `Archivo-${weight}.ttf`)),
}))).catch((e) => { console.warn('push-image fuentes', e.message); fontsJob = null; return []; }));

/** El escudo como data URL (si no carga en 2 s o no es imagen, se dibuja la inicial). */
async function crestData(url) {
  const safe = safeCrest(url);
  if (!safe) return null;
  try {
    const res = await fetch(safe, { signal: AbortSignal.timeout(2000), next: { revalidate: 604800 } });
    const type = res.headers.get('content-type') ?? '';
    if (!res.ok || !/^image\/(png|jpeg|svg\+xml|webp)/.test(type)) return null;
    return `data:${type.split(';')[0]};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch { return null; }
}

function Team({ name, crest, on, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: 300 }}>
      <div style={{ display: 'flex', width: 150, height: 150, borderRadius: 75, background: '#ffffff', alignItems: 'center', justifyContent: 'center', border: `8px solid ${on ? color : C.card}` }}>
        {crest
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- imagen generada (next/og)
          ? <img src={crest} width={100} height={100} style={{ objectFit: 'contain' }} />
          : <span style={{ fontSize: 64, fontWeight: 900, color: C.bg }}>{name[0] ?? '?'}</span>}
      </div>
      <span style={{ fontSize: 34, fontWeight: 800, color: on ? color : C.text, textAlign: 'center', lineHeight: 1.1 }}>{name}</span>
    </div>
  );
}

export async function GET(request) {
  const q = new URL(request.url).searchParams;
  const kind = KIND[q.get('k')] ? q.get('k') : 'goal';
  const home = clip(q.get('h'), 30) || 'Local', away = clip(q.get('a'), 30) || 'Visitante';
  const score = /^\d{1,2}-\d{1,2}$/.test(q.get('s') ?? '') ? q.get('s').replace('-', ' – ') : 'vs';
  const minute = clip(q.get('m'), 10), league = clip(q.get('l'), 40), x = q.get('x');
  const [hc, ac, fonts] = await Promise.all([crestData(q.get('hc')), crestData(q.get('ac')), loadFonts()]);
  const k = KIND[kind];
  const mark = kind === 'red' ? C.red : C.lime; // color del equipo resaltado

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: C.bg, padding: '36px 48px', fontFamily: fonts.length ? 'Archivo' : 'sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', background: k.bg, color: k.fg, fontSize: 30, fontWeight: 900, padding: '10px 26px', borderRadius: 999 }}><Dot type={k.dot} fg={k.fg} />{k.label}</span>
          <span style={{ display: 'flex', fontSize: 30, fontWeight: 900, color: C.text }}>Minuto 90<span style={{ color: C.lime }}>.</span></span>
        </div>
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Team name={home} crest={hc} on={x === 'h'} color={mark} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 120, fontWeight: 900, color: kind === 'goal' ? C.lime : C.text, letterSpacing: -4 }}>{score}</span>
            {minute && <span style={{ fontSize: 34, fontWeight: 800, color: C.muted }}>{minute}</span>}
          </div>
          <Team name={away} crest={ac} on={x === 'a'} color={mark} />
        </div>
        {league && <span style={{ display: 'flex', justifyContent: 'center', fontSize: 26, color: C.muted, fontWeight: 600 }}>{league}</span>}
      </div>
    ),
    { width: 1024, height: 512, fonts: fonts.length ? fonts : undefined, headers: { 'Cache-Control': 'public, max-age=86400, immutable' } },
  );
}
