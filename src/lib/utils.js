export { cn } from "cn"

// Entrada suave para elementos de lista (respeta "reducir movimiento" del sistema).
export const ENTER = "animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none"
// Retraso escalonado: cada elemento aparece 40 ms después del anterior (máx. 10 escalones).
export const stagger = (i) => ({ animationDelay: `${Math.min(i, 10) * 40}ms`, animationFillMode: "both" })
