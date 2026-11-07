'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db, firebaseReady } from '@/lib/firebase/client';
import { getVotes } from '@/lib/firebase/db';
import { useUser } from '@/lib/firebase/useUser';
import { castVote } from '@/lib/game/client';
import { POINTS } from '@/lib/game/rules.mjs';
import { PredictionBar } from './prediction-bar';

const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);

/** Votación real de quién gana (Firestore). Se vota hasta el pitazo inicial; luego queda el resultado de los votos. */
export function MatchVote({ match }) {
  const user = useUser();
  const router = useRouter();
  const [counts, setCounts] = useState(null);
  const [mine, setMine] = useState(null);
  const [msg, setMsg] = useState('');
  // Si ya pasó la hora pero ESPN aún no lo marca en vivo, el servidor rechaza el voto con un mensaje.
  const open = match.status === 'scheduled';

  useEffect(() => {
    if (!firebaseReady) return;
    getVotes(match.id).then(setCounts).catch(() => setCounts({ home: 0, draw: 0, away: 0, total: 0 }));
  }, [match.id]);
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'predictions', String(match.id), 'votes', user.uid)).then((s) => setMine(s.data()?.pick ?? null)).catch(() => {});
  }, [user, match.id]);

  if (!firebaseReady || !counts || (!open && !counts.total)) return null;

  const vote = async (pick) => {
    if (!user) return router.push(`/entrar?siguiente=${encodeURIComponent(`/partido/${match.id}`)}`);
    const before = mine;
    setMine(pick); setMsg('');
    const r = await castVote(String(match.id), pick).catch(() => ({ error: 'No se pudo guardar el voto.' }));
    if (r.error) { setMine(before); setMsg(r.error === 'login' ? 'Inicia sesión para votar.' : r.error); return; }
    getVotes(match.id).then(setCounts).catch(() => {});
  };

  const t = counts.total;
  const prediction = t
    ? { home: pct(counts.home, t), draw: pct(counts.draw, t), away: 100 - pct(counts.home, t) - pct(counts.draw, t), votes: t }
    : { home: 33, draw: 34, away: 33, votes: 0 };
  const footer = msg || (open
    ? `Vota: +${POINTS.vote} pts, y +${POINTS.correct} pts más si aciertas.`
    : 'Votación cerrada.');

  return <PredictionBar match={{ ...match, prediction }} value={mine} disabled={!open} onVote={vote} footer={footer} />;
}
