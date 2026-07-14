import type { ReactNode } from 'react';
import { useRef } from 'react';
import { useSpotlight } from '../hooks/useSpotlight';

export function StatCard({
  icon,
  value,
  label,
  accent = false,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  accent?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const spot = useSpotlight(ref);

  return (
    <div
      ref={ref}
      {...spot}
      className={`spotlight card p-6 flex flex-col gap-3 ${accent ? 'card-gradient' : ''}`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          accent ? 'bg-white/20 text-white' : 'bg-[var(--primary-50)] text-[var(--primary)]'
        }`}
      >
        {icon}
      </div>
      <div className={`text-4xl font-black ${accent ? 'text-white' : 'text-[var(--foreground)]'}`}>{value}</div>
      <div className={`text-sm font-bold ${accent ? 'text-white/80' : 'text-[var(--foreground)]/60'}`}>{label}</div>
    </div>
  );
}
