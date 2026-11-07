'use client';
// Toasts de la app (puntos ganados, jugadas del relato). toast({ title, text, icon, tone, duration, id, min })
// Si se piden antes de que el Toaster se monte, se guardan y salen al montarse.
const listeners = new Set();
const early = [];
export const onToast = (fn) => {
  listeners.add(fn);
  early.splice(0).forEach(fn);
  return () => listeners.delete(fn);
};
let seq = 0;
export function toast(t) {
  const item = { duration: 4000, tone: 'default', ...t, id: t.id ?? `t${++seq}` };
  if (listeners.size) listeners.forEach((fn) => fn(item));
  else if (early.length < 5) early.push(item);
  return item.id;
}
