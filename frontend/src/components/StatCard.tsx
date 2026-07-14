import { useRef } from 'react';
import { useTilt } from '../hooks/useTilt';
import { useSpotlight } from '../hooks/useSpotlight';
import { useCountUp } from '../hooks/useCountUp';

export function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  suffixLabel,
  accent = 'primary',
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ElementType;
  suffixLabel?: string;
  accent?: 'primary' | 'accent' | 'warning';
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tilt = useTilt(cardRef);
  const spot = useSpotlight(cardRef);
  const count = useCountUp(value);

  const colorClass =
    accent === 'accent'
      ? 'text-[var(--accent)] bg-[var(--accent)]/10'
      : accent === 'warning'
      ? 'text-[var(--warning)] bg-[var(--warning)]/10'
      : 'text-[var(--primary)] bg-[var(--primary)]/10';

  return (
    <div
      ref={cardRef}
      className="card p-5 flex flex-col gap-3 relative overflow-hidden"
      {...tilt}
      {...spot}
    >
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon size={20} />
        </div>
        {suffixLabel && (
          <div className="text-xs font-extrabold text-[var(--foreground)]/50">{suffixLabel}</div>
        )}
      </div>
      <div>
        <div className="text-3xl font-black text-[var(--foreground)] leading-none">
          {new Intl.NumberFormat('ru-RU').format(count)}{suffix}
        </div>
        <div className="mt-1 text-sm font-bold text-[var(--foreground)]/60 uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
}
