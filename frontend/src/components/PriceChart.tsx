import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { formatPriceUZS, formatPriceShort } from '../lib/utils';
import type { PriceBucket } from '../types';

export function PriceChart({ buckets }: { buckets: PriceBucket[] }) {
  const [ref, visible] = useInView<HTMLDivElement>();
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div ref={ref} className="card p-6 h-96 flex flex-col">
      <div className="flex items-center gap-2 mb-5 text-[var(--foreground)]">
        <BarChart3 size={22} className="text-[var(--primary)]" />
        <h3 className="font-bold text-lg">Narx taqsimoti</h3>
      </div>
      <div className="flex-1 flex items-end gap-3 min-h-0 px-2">
        {buckets.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
            <div className="text-xs font-black text-[var(--foreground)]/60 h-5">{b.count}</div>
            <div
              className="bar w-full rounded-t-xl"
              style={{
                height: visible ? `${(b.count / max) * 100}%` : '0%',
                transitionDelay: `${i * 80}ms`,
              }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              role="img"
              aria-label={`${formatPriceShort(b.min)} - ${formatPriceShort(b.max)}: ${b.count} ta e'lon`}
            />
            <div className="text-[10px] font-bold text-[var(--foreground)]/50 text-center leading-tight whitespace-nowrap">
              {b.min === 0 ? '0' : formatPriceShort(b.min)}
            </div>
            {hover === i && (
              <div className="absolute bottom-full mb-2 z-10 card px-3 py-2 text-xs font-bold text-[var(--foreground)] shadow-xl border border-[var(--border)]">
                {formatPriceUZS(b.min)} – {formatPriceUZS(b.max)}
                <br />
                <span className="text-[var(--primary)]">{b.count} ta e'lon</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
