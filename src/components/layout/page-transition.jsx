'use client';

import { usePathname } from 'next/navigation';

// La key por ruta vuelve a montar el contenido en cada navegación, y así se repite la animación de entrada.
export function PageTransition({ children }) {
  const path = usePathname();
  return (
    <div key={path} className="animate-in fade-in-0 slide-in-from-bottom-3 duration-300 ease-out motion-reduce:animate-none">
      {children}
    </div>
  );
}
