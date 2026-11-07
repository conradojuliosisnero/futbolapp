'use client';

import { useEffect } from 'react';

export default function ServiceWorker({ src = '/sw.js' }) {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register(src).catch(() => {});
    }
  }, [src]);
  return null;
}
