import { siteConfig } from '@/config/site';

/** variant: 'full' (pelibox.) | 'mark' (p.) */
export function Logo({ variant = 'full' }) {
  const text = variant === 'mark' ? siteConfig.logoMark : siteConfig.name.toLowerCase();
  return (
    <span className="text-[26px] font-black tracking-tight">
      {text}<span className="text-primary">.</span>
    </span>
  );
}
